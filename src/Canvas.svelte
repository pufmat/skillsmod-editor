<script lang="ts">
	import * as editor from "./editor";
	import {getContext, onMount} from "svelte";
    import type { Writable } from "svelte/store";

	let grid = getContext<Writable<editor.Grid>>("grid");
	let project = getContext<Writable<editor.Project>>("project");
	let state = getContext<Writable<editor.State>>("state");

	let tooltipElement: HTMLDivElement;
	let canvasElement: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	let viewScale = 1;
	let viewX = 0;
	let viewY = 0;

	let mouseX = 0;
	let mouseY = 0;

	let dragX = 0;
	let dragY = 0;
	let viewDragX = 0;
	let viewDragY = 0;
	let dragging = false;

	let draggedSkill: editor.Skill | null = null;
	let previousSkill: editor.Skill | null = null;

	onMount(() => {
		let newCtx = canvasElement.getContext("2d");
		if(newCtx === null) {
			throw new Error();
		}
		ctx = newCtx;

		resize();
	});

	function resize(){
		canvasElement.width = canvasElement.clientWidth;
		canvasElement.height = canvasElement.clientHeight;

		update();
	}

	function mouseMove(event: MouseEvent){
		mouseX = event.offsetX;
		mouseY = event.offsetY;

		if(dragging){
			if(draggedSkill === null){
				viewX = mouseX - viewDragX;
				viewY = mouseY - viewDragY;
			}else{
				const mouse = transformPosition({x: mouseX, y: mouseY});
				const newPos = snapToGrid({
					x: mouse.x - dragX,
					y: mouse.y - dragY
				});
				if($project.skills.find(skill => skill.pos.x === newPos.x && skill.pos.y === newPos.y) === undefined){
					draggedSkill.pos = newPos;
				}
			}
		}

		update();
	}

	function mouseDown(event: MouseEvent){
		mouseX = event.offsetX;
		mouseY = event.offsetY;

		if(event.button === editor.Button.LEFT){
			const mouse = transformPosition({x: mouseX, y: mouseY});
			draggedSkill = $project.skills.find((skill) => isMouseInsideSkill(mouse, skill)) ?? null;
			if(draggedSkill === null){
				viewDragX = mouseX - viewX;
				viewDragY = mouseY - viewY;
			}else{
				dragX = mouse.x - draggedSkill.pos.x;
				dragY = mouse.y - draggedSkill.pos.y;
			}
			dragging = true;
		}

		update();
	}

	function mouseUp(event: MouseEvent){
		mouseX = event.offsetX;
		mouseY = event.offsetY;

		const mouse = transformPosition({x: mouseX, y: mouseY});

		if(event.button === editor.Button.LEFT){
			dragging = false;
		}else if(event.button === editor.Button.MIDDLE){
			const currentSkill = $project.skills.find((skill) => isMouseInsideSkill(mouse, skill)) ?? null;
			if(currentSkill === null || previousSkill === null){
				previousSkill = currentSkill;
			}else{
				if(currentSkill === previousSkill){
					toggleRoot(currentSkill);
				}else{
					toggleConnection(currentSkill, previousSkill);
				}
				previousSkill = null;
			}
		}else if(event.button === editor.Button.RIGHT){
			const oldLength = $project.skills.length;
			$project.skills = $project.skills.filter(skill => {
				if(isMouseInsideSkill(mouse, skill)){
					if(skill.definition === $state.selected){
						removeConnections(skill);
						return false;
					}else{
						skill.definition = $state.selected;
						return true;
					}
				}else{
					return true;
				}
			});
			if($project.skills.length === oldLength){
				const pos = snapToGrid(mouse);
				if($project.skills.find(skill => skill.pos.x === pos.x && skill.pos.y === pos.y) === undefined){
					let newName: string;
					do{
						newName = editor.randomName();
					}while($project.skills.find(skill => skill.name === newName) !== undefined);

					const newSkill: editor.Skill = {
						name: newName,
						definition: $state.selected,
						pos: pos,
						root: false
					};
					$project.skills.push(newSkill);

					if(previousSkill !== null){
						toggleConnection(newSkill, previousSkill);
					}
				}
			}
			previousSkill = null;
		}

		update();
	}

	function mouseWheel(event: WheelEvent){
		const width = canvasElement.width;
		const height = canvasElement.height;

		let factor = Math.pow(2, event.deltaY * -0.0025);

		viewScale *= factor;

		let dx = (factor - 1) * (mouseX - width / 2 - viewX);
		let dy = (factor - 1) * (mouseY - height / 2 - viewY);

		viewX -= dx;
		viewY -= dy;
		viewDragX += dx;
		viewDragY += dy;

		update();
	}

	function removeConnections(skill: editor.Skill){
		$project.connections = $project.connections.filter(connection => {
			for(const skillIndex of [0, 1]){
				if(connection[skillIndex] === skill){
					return false;
				}
			}
			return true;
		});
	}

	function toggleConnection(skill0: editor.Skill, skill1: editor.Skill){
		if(skill0 === skill1){
			return;
		}
		for(const [connectionIndex, connection] of $project.connections.entries()){
			let matches = 0;
			for(const skillIndex of [0, 1]){
				const skill = connection[skillIndex];
				if(skill === skill0 || skill === skill1){
					matches++;
				}
			}
			if(matches === 2){
				$project.connections.splice(connectionIndex, 1);
				return;
			}
		}
		$project.connections.push([
			skill0,
			skill1
		]);
		$project.connections = $project.connections;
	}

	function toggleRoot(skill: editor.Skill){
		skill.root = !skill.root;
	}

	function transformPosition(pos: editor.Position): editor.Position{
		const width = canvasElement.width;
		const height = canvasElement.height;

		return scalePosition({
			x: pos.x - viewX - width / 2,
			y: pos.y - viewY - height / 2
		})
	}

	function scalePosition(pos: editor.Position): editor.Position{
		return {
			x: pos.x / viewScale,
			y: pos.y / viewScale
		}
	}

	function isMouseInsideSkill(mouse: editor.Position, skill: editor.Skill){
		return mouse.x > skill.pos.x - 13 && mouse.y > skill.pos.y - 13 && mouse.x < skill.pos.x + 13 && mouse.y < skill.pos.y + 13;
	}

	function snapToGrid(pos: editor.Position): editor.Position{
		switch($grid.type){
		case editor.GridType.NONE:
			return pos;
		case editor.GridType.SQUARE:
			return {
				x: Math.round(pos.x / $grid.spacing) * $grid.spacing,
				y: Math.round(pos.y / $grid.spacing) * $grid.spacing
			};
		case editor.GridType.HEX_FLAT:
		case editor.GridType.HEX_POINTY:
			{
				const tmpSize = $grid.spacing * Math.sqrt(3) / 1.5;

				let i;
				let j;

				if($grid.type === editor.GridType.HEX_FLAT){
					i = pos.x;
					j = pos.y;
				}else{
					i = pos.y;
					j = pos.x;
				}

				i /= tmpSize;
				j = j * 1.5 / $grid.spacing - 1;

				let k = Math.floor(i - j);
				let l = Math.floor((k + 2 * i + 1) / 3);
				let m = Math.floor((k - j - i) / 3);

				i = l * tmpSize - m * tmpSize / 2;
				j = -m * $grid.spacing;

				if($grid.type === editor.GridType.HEX_FLAT){
					return {x: i, y: j};
				}else{
					return {x: j, y: i};
				}
			}
		}
	}

	function update(){
		updateTooltip();
		draw();
	}

	function updateTooltip(){
		const mouse = transformPosition({x: mouseX, y: mouseY});

		for(const skill of $project.skills){
			if(skill.definition === null){
				continue;
			}
			if(isMouseInsideSkill(mouse, skill)){
				tooltipElement.innerText = skill.definition.name;
				tooltipElement.style.visibility = "visible";
				tooltipElement.style.left = mouseX + "px";
				tooltipElement.style.top = mouseY + "px";
				return;
			}
		}

		tooltipElement.style.visibility = "hidden";
	}

	function draw(){
		const width = canvasElement.width;
		const height = canvasElement.height;

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, width, height);
		ctx.setTransform(viewScale, 0, 0, viewScale, viewX + width / 2, viewY + height / 2);

		drawGrid();
		drawConnections();
		drawSkills();
	}

	function drawGrid(){
		switch($grid.type){
		case editor.GridType.SQUARE:
			for(let i = -$grid.size; i <= $grid.size; i++) {
				for(let j = -$grid.size; j <= $grid.size; j++) {
					drawDot(i, j);
				}
			}
			break;
		case editor.GridType.HEX_FLAT:
		case editor.GridType.HEX_POINTY:
			for(let i = -$grid.size; i <= $grid.size; i++) {
				for(let j = Math.max(0, -i) - $grid.size; j <= Math.min(0, -i) + $grid.size; j++){
					const k = (j + i / 2) * Math.sqrt(3) / 1.5

					if($grid.type === editor.GridType.HEX_FLAT){
						drawDot(k, i);
					}else{
						drawDot(i, k);
					}
				}
			}
			break;
		}
	}

	function drawSkills(){
		for(const skill of $project.skills){
			if(skill.definition === null){
				ctx.fillStyle = "#666666";
			}else{
				ctx.fillStyle = skill.definition.color;
			}
			if(skill.root){
				ctx.beginPath();
				ctx.arc(skill.pos.x, skill.pos.y, 13, 0, Math.PI * 2);
				ctx.fill();
			}else{
				ctx.fillRect(skill.pos.x - 13, skill.pos.y - 13, 26, 26);
			}
		}
	}

	function drawConnections(){
		ctx.strokeStyle = "#000000";
		ctx.lineWidth = 4;

		for(const connection of $project.connections){
			if(connection[0] === undefined || connection[1] === undefined){
				continue;
			}

			ctx.beginPath();
			ctx.moveTo(connection[0].pos.x, connection[0].pos.y);
			ctx.lineTo(connection[1].pos.x, connection[1].pos.y);
			ctx.stroke();
		}

		if(previousSkill !== null){
			const mouse = transformPosition({x: mouseX, y: mouseY});

			ctx.beginPath();
			ctx.moveTo(previousSkill.pos.x, previousSkill.pos.y);
			ctx.lineTo(mouse.x, mouse.y);
			ctx.stroke();
		}
	}

	function drawDot(x: number, y: number){
		ctx.fillStyle = "#aaaaaa";
		ctx.beginPath();
		ctx.arc($grid.spacing * x, $grid.spacing * y, x === 0 && y === 0 ? 8 : 5, 0, Math.PI * 2);
		ctx.fill();
	}

	$: {
		$grid,
		$project;
		$state;

		if(ctx !== undefined){
			draw();
		}
	}
</script>

<svelte:window on:resize={resize} />

<div class="container">
	<canvas
		bind:this={canvasElement}
		on:mousedown={mouseDown}
		on:mouseup={mouseUp}
		on:mousemove={mouseMove}
		on:wheel={mouseWheel}
		on:contextmenu|preventDefault
	/>
	<div class="tooltip" bind:this={tooltipElement}></div>
</div>

<style lang="scss">
	.container{
		flex: 1;
		position: relative;
	}
	canvas {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
	.tooltip {
		position: absolute;
		font-size: 16px;
		padding: 3px 6px;
		color: #ffffff;
		background-color: rgba(0, 0, 0, 0.75);
		border: 1px solid #000000;
		user-select: none;
		pointer-events: none;
		border-radius: 8px;
		margin-top: 16px;
	}
</style>