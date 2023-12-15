## 🗺️ | Rotas Express

### / (Home) ${\color{green}GET}$
- Response:
```json
{
	"status": 200,
	"yourIp": "::1",
	"router": "/"
}
```

### /discord (Bot Infos) ${\color{green}GET}$
- Resquest:
```json
{
	"userId": "379089880887721995"
}
```

- Response:
```json
{
	"status": 200,
	"bot": {
		"uptime": "385.66",
		"commands": {
			"loaded": 16,
			"names": [
				[...]
			]
		},
		"buttons": 0,
		"modals": 1,
		"selects": 0
	},
	"guilds": {
		"totalUsers": 5,
		"totalGuilds": 1,
		"guilds": [
			{
				"name": "SeventyHost - Beta",
				"users": 5
			}
		]
	}
}
```

### /discord/user ${\color{green}POST}$
- Response:
```json
{
	"user": {...},
	"presence": {
		"activities": [],
		"status": "online",
		"clientStatus": {
			"desktop": "online"
		}
	},
	"member": {
		"guildId": "...",
		"roles": [
			{
				"id": "",
				"name": "@everyone",
				"color": 0
			}
		]
	}
}
```
