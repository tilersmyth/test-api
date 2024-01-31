# Nonconforming Product Server

## Development
*Note: server is intended to connect to existing database setup for the virtual pickseet*
1. Clone and `cd` into repo
2. `npm run install`
3. `cp sample.env .env` and enter your local database credentials
4. `npm run start:dev`

## Production
*This server currently runs on CPU (static ip: 192.168.1.60) sitting on the floor of the system's office*
1. While at the warehouse (or VPN'd into the network), run `ssh walden@192.168.1.60` (ask Tyler for pw)
2. `cd ncp-server`
3. `git pull`
4. `docker compose build`
5. `docker compose up -d`