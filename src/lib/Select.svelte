<script lang="ts">
	export let value: string | number;
</script>

<select bind:value>
	<slot />
</select>

<style lang="scss">
	select {
		flex: 1;
		background-color: #eeeeee;
		border: 1px solid #888888;
		border-radius: 4px;
		padding: 3px 6px;
		font-size: 16px;
		cursor: pointer;
	}
</style>