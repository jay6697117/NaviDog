package db

import (
	"fmt"
	"GoNavi-Wails/internal/connection"
)

type Database interface {
	Connect(config connection.ConnectionConfig) error
	Close() error
	Ping() error
	Query(query string) ([]map[string]interface{}, []string, error)
	Exec(query string) (int64, error)
	GetDatabases() ([]string, error)
	GetTables(dbName string) ([]string, error)
	GetCreateStatement(dbName, tableName string) (string, error)
	GetColumns(dbName, tableName string) ([]connection.ColumnDefinition, error)
	GetAllColumns(dbName string) ([]connection.ColumnDefinitionWithTable, error)
	GetIndexes(dbName, tableName string) ([]connection.IndexDefinition, error)
	GetForeignKeys(dbName, tableName string) ([]connection.ForeignKeyDefinition, error)
	GetTriggers(dbName, tableName string) ([]connection.TriggerDefinition, error)
}

type BatchApplier interface {
	ApplyChanges(tableName string, changes connection.ChangeSet) error
}

// Factory
func NewDatabase(dbType string) (Database, error) {
	switch dbType {
	case "mysql":
		return &MySQLDB{}, nil
	case "postgres":
		return &PostgresDB{}, nil
	case "sqlite":
		return &SQLiteDB{}, nil
	default:
		// Default to MySQL for backward compatibility if empty
		if dbType == "" {
			return &MySQLDB{}, nil
		}
		return nil, fmt.Errorf("unsupported database type: %s", dbType)
	}
}
