<div>
	<span>
		<slot />
	</span>
</div>

<style lang="scss">
	div {
		flex-grow: 1;
		flex-shrink: 0.5;
		font-size: 16px;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
	}
	span {
		text-overflow: ellipsis;
		overflow: hidden;
	}
</style>