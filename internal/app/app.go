package app

import (
	"context"
	"fmt"
	"sync"

	"GoNavi-Wails/internal/connection"
	"GoNavi-Wails/internal/db"
)

// App struct
type App struct {
	ctx     context.Context
	dbCache map[string]db.Database // Cache for DB connections
	mu      sync.Mutex             // Mutex for cache access
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		dbCache: make(map[string]db.Database),
	}
}

// Startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
}

// Shutdown is called when the app terminates
func (a *App) Shutdown(ctx context.Context) {
	a.mu.Lock()
	defer a.mu.Unlock()
	for _, dbInst := range a.dbCache {
		dbInst.Close()
	}
}

// Helper: Generate a unique key for the connection config
func getCacheKey(config connection.ConnectionConfig) string {
	sshPart := ""
	if config.UseSSH {
		sshPart = fmt.Sprintf("|ssh:%s@%s:%d|%s", config.SSH.User, config.SSH.Host, config.SSH.Port, config.SSH.KeyPath)
		// We don't include SSH password in key string to avoid log exposure if key is logged, 
		// but for cache uniqueness it is critical. 
		// Let's include a hash or just the value if we assume internal use.
		// Including value for correctness.
		sshPart += "|" + config.SSH.Password
	}
	return fmt.Sprintf("%s|%s:%s@%s:%d|%s%s", config.Type, config.User, config.Password, config.Host, config.Port, config.Database, sshPart)
}

// Helper: Get or create a database connection
func (a *App) getDatabase(config connection.ConnectionConfig) (db.Database, error) {
	key := getCacheKey(config)

	a.mu.Lock()
	defer a.mu.Unlock()

	if dbInst, ok := a.dbCache[key]; ok {
		if err := dbInst.Ping(); err == nil {
			return dbInst, nil
		}
		dbInst.Close()
		delete(a.dbCache, key)
	}

	dbInst, err := db.NewDatabase(config.Type)
	if err != nil {
		return nil, err
	}

	if err := dbInst.Connect(config); err != nil {
		return nil, err
	}

	a.dbCache[key] = dbInst
	return dbInst, nil
}
