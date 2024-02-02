export function getTimestamp() {
	const now = new Date();

	// Obter o horário atual no formato [ HH:MM:SS ]
	const currentHour = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(
		2,
		"0",
	)}:${String(now.getSeconds()).padStart(2, "0")}`;

	// Obter a data atual no formato [ DDD/MMM/AAAA, ás HH:MM:SS ]
	const fulltimer = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(
		2,
		"0",
	)}/${now.getFullYear()}, ás ${currentHour}`;

	// Obter a data atual no formato [ DDD_MMM_AAAA ]
	const dayTimer = `${String(now.getDate()).padStart(2, "0")}_${String(now.getMonth() + 1).padStart(
		2,
		"0",
	)}_${now.getFullYear()}`;

	const timestamp = Date.now();

	return { currentHour, fulltimer, dayTimer, timestamp };
}
