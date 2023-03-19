<button on:click>
	<slot />
</button>

<style>
	button {
		flex: 1;
		color: #000000;
		background-color: #eeeeee;
		border: 1px solid #888888;
		border-radius: 4px;
		padding: 3px 6px;
		font-size: 16px;
		outline: 0;
		cursor: pointer;
	}
</style>