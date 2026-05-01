CREATE TABLE event_store (

 event_id UUID PRIMARY KEY,
 event_type TEXT NOT NULL,
 aggregate_id UUID,
 payload JSONB,
 signature TEXT,
 node_id TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

CREATE INDEX idx_event_type
ON event_store(event_type);

CREATE INDEX idx_aggregate
ON event_store(aggregate_id);