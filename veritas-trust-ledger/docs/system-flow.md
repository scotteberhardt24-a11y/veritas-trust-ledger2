VERITAS LEDGER SYSTEM FLOW

1 USER CREATES EVENT
React Native client generates event payload

2 EVENT SIGNED
Client signs event using Ed25519

3 EVENT SENT
Client sends event to API endpoint

POST /event

4 API VALIDATION
API verifies:
- schema
- signature
- fraud rules

5 EVENT HASHED
hash = SHA256(previousHash + event)

6 EVENT STORED
Event appended to PostgreSQL events table

7 EVENT BROADCAST
Event published to Redis network

8 CONSENSUS
Nodes validate event integrity

9 REPLAY ENGINE
System rebuilds state from events

10 TRUST SCORE
Trust engine updates reputation scores

11 RESPONSE
API returns success to client