package db

import (
	"database/sql"
	"fmt"
	"time"

	"GoNavi-Wails/internal/connection"
	"GoNavi-Wails/internal/utils"

	_ "github.com/lib/pq"
)

type PostgresDB struct {
	conn *sql.DB
}

func (p *PostgresDB) getDSN(config connection.ConnectionConfig) string {
	// postgres://user:password@host:port/dbname?sslmode=disable
	host := config.Host
	port := config.Port
	// SSH placeholder kept from original
	if config.UseSSH {
		// Logic to be implemented
	}

	dbname := config.Database
	if dbname == "" {
		dbname = "postgres" // Default DB
	}

	return fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=disable",
		config.User, config.Password, host, port, dbname)
}

func (p *PostgresDB) Connect(config connection.ConnectionConfig) error {
	dsn := p.getDSN(config)
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return err
	}
	p.conn = db
	
	// Force verification
	return p.Ping()
}

func (p *PostgresDB) Close() error {
	if p.conn != nil {
		return p.conn.Close()
	}
	return nil
}

func (p *PostgresDB) Ping() error {
	if p.conn == nil {
		return fmt.Errorf("connection not open")
	}
	ctx, cancel := utils.ContextWithTimeout(5 * time.Second)
	defer cancel()
	return p.conn.PingContext(ctx)
}

func (p *PostgresDB) Query(query string) ([]map[string]interface{}, []string, error) {
	if p.conn == nil {
		return nil, nil, fmt.Errorf("connection not open")
	}


rows, err := p.conn.Query(query)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	columns, err := rows.Columns()
	if err != nil {
		return nil, nil, err
	}

	var resultData []map[string]interface{}

	for rows.Next() {
		values := make([]interface{}, len(columns))
		valuePtrs := make([]interface{}, len(columns))
		for i := range columns {
			valuePtrs[i] = &values[i]
		}

		if err := rows.Scan(valuePtrs...); err != nil {
			continue
		}

		entry := make(map[string]interface{})
		for i, col := range columns {
			var v interface{}
			val := values[i]
			b, ok := val.([]byte)
			if ok {
				v = string(b)
			} else {
				v = val
			}
			entry[col] = v
		}
		resultData = append(resultData, entry)
	}

	return resultData, columns, nil
}

func (p *PostgresDB) Exec(query string) (int64, error) {
	if p.conn == nil {
		return 0, fmt.Errorf("connection not open")
	}
	res, err := p.conn.Exec(query)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}

func (p *PostgresDB) GetDatabases() ([]string, error) {
	data, _, err := p.Query("SELECT datname FROM pg_database WHERE datistemplate = false")
	if err != nil {
		return nil, err
	}
	var dbs []string
	for _, row := range data {
		if val, ok := row["datname"]; ok {
			dbs = append(dbs, fmt.Sprintf("%v", val))
		}
	}
	return dbs, nil
}

func (p *PostgresDB) GetTables(dbName string) ([]string, error) {
	query := "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'"
	data, _, err := p.Query(query)
	if err != nil {
		return nil, err
	}
	
	var tables []string
	for _, row := range data {
		if val, ok := row["tablename"]; ok {
			tables = append(tables, fmt.Sprintf("%v", val))
		}
	}
	return tables, nil
}

func (p *PostgresDB) GetCreateStatement(dbName, tableName string) (string, error) {
	return fmt.Sprintf("-- SHOW CREATE TABLE not fully supported for PostgreSQL in this MVP.\n-- Table: %s", tableName), nil
}

func (p *PostgresDB) GetColumns(dbName, tableName string) ([]connection.ColumnDefinition, error) {
	return []connection.ColumnDefinition{}, nil
}

func (p *PostgresDB) GetIndexes(dbName, tableName string) ([]connection.IndexDefinition, error) {
	return []connection.IndexDefinition{}, nil
}

func (p *PostgresDB) GetForeignKeys(dbName, tableName string) ([]connection.ForeignKeyDefinition, error) {
	return []connection.ForeignKeyDefinition{}, nil
}

func (p *PostgresDB) GetTriggers(dbName, tableName string) ([]connection.TriggerDefinition, error) {
	return []connection.TriggerDefinition{}, nil
}

func (p *PostgresDB) GetAllColumns(dbName string) ([]connection.ColumnDefinitionWithTable, error) {
	return []connection.ColumnDefinitionWithTable{}, nil
}
