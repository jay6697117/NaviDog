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
	return fmt.Sprintf("%s|%s|%s:%d|%s|%s|%v", config.Type, config.User, config.Host, config.Port, config.Database, config.SSH.Host, config.UseSSH)
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
