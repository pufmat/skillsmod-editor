<script lang="ts">
	import * as editor from "./editor";
	import {getContext, onMount} from "svelte";
    import type { Writable } from "svelte/store";
	import * as jdenticon from "jdenticon";
    import { activeTheme } from "./theme";

	let grid = getContext<Writable<editor.Grid>>("grid");
	let project = getContext<Writable<editor.Project>>("project");
	let state = getContext<Writable<editor.State>>("state");
	let settings = getContext<Writable<editor.Settings>>("settings");

	let tooltipElement: HTMLDivElement;
	let canvasElement: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	let viewScale = 1;
	let viewPos = {x: 0, y: 0}; // Screen Space
	let viewDragStartPos: editor.Position | null = null; // Screen Space
	let selectionStartPos: editor.Position | null = null; // Screen Space
	let skillDragStartPos: editor.Position | null = null;  // Editor Space

	let mouse = {x: 0, y: 0}; // Screen Space
	let transformedMouse = {x: 0, y: 0}; // Editor Space

	let previousSkill: editor.Skill | null = null;
	let draggedSkill: editor.Skill | null = null;
	let selectedSkills: editor.Skill[] = [];

	const theme = activeTheme();

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
		updateMouse(event.offsetX, event.offsetY);

		if(viewDragStartPos !== null){
			viewPos.x = mouse.x - viewDragStartPos.x;
			viewPos.y = mouse.y - viewDragStartPos.y;
		}

		if(skillDragStartPos !== null && draggedSkill !== null){
			const newPos = snapToGrid({
				x: transformedMouse.x - skillDragStartPos.x,
				y: transformedMouse.y - skillDragStartPos.y
			});

			const dx = newPos.x - draggedSkill.pos.x;
			const dy = newPos.y - draggedSkill.pos.y;

			if(Array.from(selectedSkills).every(skill => {
				const collidingSkill = getSkillAt({
					x: skill.pos.x + dx,
					y: skill.pos.y + dy
				});
				return collidingSkill === null || selectedSkills.includes(collidingSkill);
			})){
				for(const skill of selectedSkills){
					skill.pos.x += dx;
					skill.pos.y += dy;
				}
				$project.skills = $project.skills;
			}
		}

		update();
	}

	function mouseDown(event: MouseEvent){
		updateMouse(event.offsetX, event.offsetY);

		switch(event.button){
		case editor.Button.LEFT:
			draggedSkill = getHoveredSkill(transformedMouse);
			if(draggedSkill === null){
				selectionStartPos = {
					x: mouse.x,
					y: mouse.y
				};
			}else{
				if(selectedSkills.includes(draggedSkill)){
					if(event.ctrlKey){
						selectedSkills = selectedSkills.filter(s => s !== draggedSkill)
					}
				}else{
					if(event.ctrlKey || event.shiftKey){
						selectedSkills = [...selectedSkills, draggedSkill];
					}else{
						selectedSkills = [draggedSkill];
					}
				}
				skillDragStartPos = {
					x: transformedMouse.x - draggedSkill.pos.x,
					y: transformedMouse.y - draggedSkill.pos.y
				};
			}
			break;
		case editor.Button.MIDDLE:
			if($project.skills.some((skill) => isMouseInsideSkill(transformedMouse, skill))){
				const hoveredSkill = getHoveredSkill(transformedMouse);
				if(hoveredSkill !== null){
					beginConnection(hoveredSkill);
				}
			}else{
				viewDragStartPos = {
					x: mouse.x - viewPos.x,
					y: mouse.y - viewPos.y
				};
			}
			break;
		}

		update();
	}

	function mouseUp(event: MouseEvent){
		updateMouse(event.offsetX, event.offsetY);

		switch(event.button){
		case editor.Button.LEFT:
			if(selectionStartPos !== null){
				const startPos = selectionStartPos;
				const skillsInsideSelection = $project.skills.filter((skill) => isSkillInsideSelection(
					skill,
					screenToEditorPos(startPos),
					transformedMouse
				));
				if(event.ctrlKey){
					selectedSkills = [...new Set([...selectedSkills, ...skillsInsideSelection])]
							.filter(s => selectedSkills.includes(s) !== skillsInsideSelection.includes(s));
				}else if(event.shiftKey){
					selectedSkills = [...new Set([...selectedSkills, ...skillsInsideSelection])];
				}else{
					selectedSkills = skillsInsideSelection;
				}
				selectionStartPos = null;
			}
			skillDragStartPos = null;
			break;
		case editor.Button.MIDDLE:
			if(viewDragStartPos === null){
				const hoveredSkill = getHoveredSkill(transformedMouse);
				if(hoveredSkill !== null){
					endConnection(hoveredSkill, $state.selectedConnectionType, $state.selectedConnectionDirection);
				}
			}else{
				viewDragStartPos = null;
			}
			break;
		case editor.Button.RIGHT:
			if($state.selectedDefinition !== null){
				toggleSkillAt(snapToGrid(transformedMouse), $state.selectedDefinition);
			}
			break;
		}

		update();
	}

	function mouseWheel(event: WheelEvent){
		const width = canvasElement.width;
		const height = canvasElement.height;

		let factor = Math.pow(2, event.deltaY * -0.0025);

		viewScale *= factor;

		let dx = (factor - 1) * (mouse.x - width / 2 - viewPos.x);
		let dy = (factor - 1) * (mouse.y - height / 2 - viewPos.y);

		viewPos.x -= dx;
		viewPos.y -= dy;
		if(viewDragStartPos !== null){
			viewDragStartPos.x += dx;
			viewDragStartPos.y += dy;
		}

		update();
	}

	function keyUp(event: KeyboardEvent){
		for(const dialog of document.getElementsByTagName("dialog")){
			if(dialog.open){
				return;
			}
		}

		switch(event.key){
		case "a":
			if($state.selectedDefinition !== null){
				createSkill(transformedMouse, $state.selectedDefinition);
			}
			return;
		case "t":
			if($state.selectedDefinition !== null){
				toggleSkillAt(transformedMouse, $state.selectedDefinition);
			}
			return;
		case "c":
			toggleConnectionAt(transformedMouse, $state.selectedConnectionType, $state.selectedConnectionDirection);
			return;
		}

		let skills = selectedSkills;

		const lowerCaseKey = event.key.toLowerCase();
		if(event.key === lowerCaseKey){
			const skill = getHoveredSkill(transformedMouse);
			skills = skill === null ? [] : [skill];
		}

		switch(lowerCaseKey){
		case "e":
			if($state.selectedDefinition !== null){
				for(const skill of skills){
					editSkill(skill, $state.selectedDefinition);
				}
			}
			break;
		case "d":
			for(const skill of skills){
				deleteSkill(skill);
			}
			break;
		case "r":
			toggleManyRoots(skills);
			break;
		case "x":
			for(const skill of skills){
				removeAllConnections(skill);
			}
			break;
		case "c":
			if(skills.length <= 16){
				toggleManyConnections(skills, $state.selectedConnectionType);
			}
			break;
		}

		update();
	}

	function getSkillAt(pos: editor.Position): editor.Skill | null {
		return $project.skills.find(skill => skill.pos.x === pos.x && skill.pos.y === pos.y) ?? null;
	}

	function getHoveredSkill(mouse: editor.Position): editor.Skill | null {
		return $project.skills.find((skill) => isMouseInsideSkill(mouse, skill)) ?? null
	}

	function createSkill(pos: editor.Position, definition: editor.Definition): boolean {
		const snappedPos = snapToGrid(pos);

		if(getSkillAt(snappedPos) !== null){
			return false;
		}

		let name: string;
		do{
			name = editor.randomIdentifier();
		}while($project.skills.some(skill => skill.id === name));

		$project.skills.push({
			id: name,
			definition,
			pos: snappedPos,
			root: false
		});
		$project.skills = $project.skills;

		return true;
	}

	function deleteSkill(skill: editor.Skill): boolean {
		const index = $project.skills.indexOf(skill);
		if(index === -1){
			return false;
		}

		removeAllConnections(skill);
		if(previousSkill === skill){
			previousSkill = null;
		}

		$project.skills.splice(index, 1);
		$project.skills = $project.skills;
		return true;
	}

	function editSkill(skill: editor.Skill, definition: editor.Definition): boolean {
		if(skill.definition !== definition){
			skill.definition = definition;
			return true;
		}
		return false;
	}

	function toggleSkillAt(pos: editor.Position, definition: editor.Definition){
		const hoveredSkill = getHoveredSkill(pos);
		if(hoveredSkill !== null){
			if(editSkill(hoveredSkill, definition)){
				return;
			}
			if(deleteSkill(hoveredSkill)){
				return;
			}
		}
		createSkill(pos, definition);
	}

	function toggleManyRoots(skills: editor.Skill[]){
		if(skills.every(skill => skill.root)){
			for(const skill of skills){
				skill.root = false;
			}
		}else{
			for(const skill of skills){
				skill.root = true;
			}
		}
		$project.skills = $project.skills;
	}

	function toggleConnectionAt(pos: editor.Position, type: editor.ConnectionType, direction: editor.ConnectionDirection){
		const hoveredSkill = getHoveredSkill(pos);
		if(hoveredSkill !== null){
			if(previousSkill === null){
				beginConnection(hoveredSkill);
			}else{
				endConnection(hoveredSkill, type, direction);
			}
		}
	}

	function beginConnection(skill: editor.Skill){
		previousSkill = skill;
	}

	function endConnection(skill: editor.Skill, type: editor.ConnectionType, direction: editor.ConnectionDirection){
		if(previousSkill !== null){
			if(skill !== previousSkill){
				toggleConnection(previousSkill, skill, type, direction);
			}
			previousSkill = null;
		}
	}

	function removeAllConnections(skill: editor.Skill){
		$project.connections = $project.connections.filter(connection => {
			return !connection.skills.includes(skill);
		});
	}

	function toggleConnection(skillA: editor.Skill, skillB: editor.Skill, type: editor.ConnectionType, direction: editor.ConnectionDirection){
		if(skillA === skillB){
			return;
		}

		for(const [index, connection] of $project.connections.entries()){
			const otherSkillA = connection.skills[0];
			const otherSkillB = connection.skills[1];

			const swapped = skillA === otherSkillB && skillB === otherSkillA;
			if((skillA === otherSkillA && skillB === otherSkillB) || swapped){
				if(
					(
						swapped
						&& direction === editor.ConnectionDirection.UNIDIRECTIONAL
					)
					|| connection.type !== type
					|| connection.direction !== direction
				){
					connection.skills[0] = skillA;
					connection.skills[1] = skillB;
					connection.type = type;
					connection.direction = direction;
				}else{
					$project.connections.splice(index, 1);
				}
				$project.connections = $project.connections;
				return;
			}
		}

		$project.connections.push({
			type,
			direction,
			skills: [skillA, skillB]
		});
		$project.connections = $project.connections;
	}

	function toggleManyConnections(skills: editor.Skill[], type: editor.ConnectionType){
		const pairs = skills.flatMap(skillA => skills.slice(1).map(skillB => [skillA, skillB] as const));

		if(pairs.filter(pair => createConnection(...pair, type)).length === 0){
			for(const pair of pairs){
				removeConnection(...pair);
			}
		}
	}

	function createConnection(skillA: editor.Skill, skillB: editor.Skill, type: editor.ConnectionType): boolean {
		if(skillA === skillB){
			return false;
		}

		for(const connection of $project.connections.values()){
			const otherSkillA = connection.skills[0];
			const otherSkillB = connection.skills[1];

			if((skillA === otherSkillA && skillB === otherSkillB) || (skillA === otherSkillB && skillB === otherSkillA)){
				if(connection.type === type && connection.direction === editor.ConnectionDirection.BIDIRECTIONAL){
					return false;
				}else{
					connection.type = type;
					connection.direction = editor.ConnectionDirection.BIDIRECTIONAL;
					$project.connections = $project.connections;
					return true;
				}
			}
		}

		$project.connections.push({
			type: type,
			direction: editor.ConnectionDirection.BIDIRECTIONAL,
			skills: [skillA, skillB]
		});
		$project.connections = $project.connections;
		return true;
	}

	function removeConnection(skillA: editor.Skill, skillB: editor.Skill): boolean {
		const oldLength = $project.connections.length;
		$project.connections = $project.connections.filter(connection => {
			const otherSkillA = connection.skills[0];
			const otherSkillB = connection.skills[1];

			return (skillA !== otherSkillA || skillB !== otherSkillB) && (skillA !== otherSkillB || skillB !== otherSkillA);
		});
		return $project.connections.length !== oldLength;
	}

	function updateMouse(x: number, y: number) {
		mouse.x = x;
		mouse.y = y;

		transformedMouse = screenToEditorPos(mouse);
	}

	function screenToEditorPos(pos: editor.Position){
		const width = canvasElement.width;
		const height = canvasElement.height;

		return {
			x: (pos.x - viewPos.x - width / 2) / viewScale,
			y: (pos.y - viewPos.y - height / 2) / viewScale
		};
	}

	function isSkillInsideSelection(skill: editor.Skill, selectionStart: editor.Position, selectionEnd: editor.Position){
		const minX = Math.min(selectionStart.x, selectionEnd.x);
		const minY = Math.min(selectionStart.y, selectionEnd.y);
		const maxX = Math.max(selectionStart.x, selectionEnd.x);
		const maxY = Math.max(selectionStart.y, selectionEnd.y);
		return skill.pos.x - 13 > minX && skill.pos.y - 13 > minY && skill.pos.x + 13 < maxX && skill.pos.y + 13 < maxY;
	}

	function isMouseInsideSkill(mouse: editor.Position, skill: editor.Skill){
		return mouse.x > skill.pos.x - 13 && mouse.y > skill.pos.y - 13 && mouse.x < skill.pos.x + 13 && mouse.y < skill.pos.y + 13;
	}

	function snapToGrid(pos: editor.Position): editor.Position {
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
			return (() => {
				let i;
				let j;

				if($grid.type === editor.GridType.HEX_FLAT){
					i = pos.x;
					j = pos.y;
				}else{
					i = pos.y;
					j = pos.x;
				}

				const s = $grid.spacing * Math.sqrt(3) / 1.5;

				i /= s;
				j = j * 1.5 / $grid.spacing - 1;

				let k = Math.floor(i - j);
				let l = Math.floor((k + 2 * i + 1) / 3);
				let m = Math.floor((k - j - i) / 3);

				i = l * s - m * s / 2;
				j = -m * $grid.spacing;

				if($grid.type === editor.GridType.HEX_FLAT){
					return {x: i, y: j};
				}else{
					return {x: j, y: i};
				}
			})();
		}
	}

	function update(){
		updateTooltip();
		draw();
	}

	function updateTooltip(){
		for(const skill of $project.skills){
			if(isMouseInsideSkill(transformedMouse, skill)){
				tooltipElement.innerText = skill.definition.id;
				tooltipElement.style.visibility = "visible";
				tooltipElement.style.left = mouse.x + "px";
				tooltipElement.style.top = mouse.y + "px";
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

		ctx.setTransform(viewScale, 0, 0, viewScale, viewPos.x + width / 2, viewPos.y + height / 2);

		drawGrid();
		drawConnections();
		drawSkills();

		ctx.setTransform(1, 0, 0, 1, 0, 0);

		drawSelection();
	}

	function drawSelection(){
		if(selectionStartPos !== null){
			ctx.strokeStyle = $theme["editor-selection-border-color"];
			ctx.fillStyle = $theme["editor-selection-background-color"];
			ctx.lineWidth = 2;
			ctx.setLineDash([3, 3]);
			ctx.beginPath();
			ctx.rect(
				selectionStartPos.x,
				selectionStartPos.y,
				mouse.x - selectionStartPos.x,
				mouse.y - selectionStartPos.y
			);
			ctx.closePath();
			ctx.stroke();
			ctx.fill();
		}
	}

	function drawGrid(){
		ctx.fillStyle = $theme["editor-grid-color"];
		ctx.beginPath();
		switch($grid.type){
		case editor.GridType.SQUARE:
			for(let i = -$grid.size; i <= $grid.size; i++) {
				for(let j = -$grid.size; j <= $grid.size; j++) {
					addDot(i, j);
				}
			}
			break;
		case editor.GridType.HEX_FLAT:
		case editor.GridType.HEX_POINTY:
			for(let i = -$grid.size; i <= $grid.size; i++) {
				for(let j = Math.max(0, -i) - $grid.size; j <= Math.min(0, -i) + $grid.size; j++){
					const k = (j + i / 2) * Math.sqrt(3) / 1.5

					if($grid.type === editor.GridType.HEX_FLAT){
						addDot(k, i);
					}else{
						addDot(i, k);
					}
				}
			}
			break;
		}
		ctx.fill();
	}

	function drawSkills(){
		ctx.strokeStyle = $theme["editor-root-border-color"];
		ctx.fillStyle = $theme["editor-root-color"];
		ctx.font = "bold 16px sans-serif";
		ctx.textAlign = "center";
		ctx.lineWidth = 4;
		const metrics = ctx.measureText("R");
		const halfHeight = (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;

		const transform = ctx.getTransform();
		for(const skill of $project.skills){
			ctx.setTransform(
				transform.a,
				transform.b,
				transform.c,
				transform.d,
				transform.e + (skill.pos.x - 13) * transform.a,
				transform.f + (skill.pos.y - 13) * transform.d,
			);
			jdenticon.drawIcon(ctx, skill.definition.icon, 26, $theme["jdenticon-config"]);
			if(skill.root){
				ctx.strokeText("R", 13, 13 + halfHeight);
				ctx.fillText("R", 13, 13 + halfHeight);
			}
		}
		ctx.setTransform(
			transform.a,
			transform.b,
			transform.c,
			transform.d,
			transform.e,
			transform.f
		)

		ctx.strokeStyle = $theme["editor-selection-border-color"];
		ctx.fillStyle = $theme["editor-selection-background-color"];
		ctx.lineWidth = 2;
		ctx.setLineDash([3, 3]);
		ctx.beginPath();
		for(const skill of $project.skills){
			if(selectedSkills.includes(skill)){
				ctx.rect(
					skill.pos.x - 16,
					skill.pos.y - 16,
					32,
					32
				);
			}
		}
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
	}

	function drawConnections(){
		for(const connection of $project.connections){
			const isSelected = selectedSkills.some(skill => connection.skills.includes(skill));

			ctx.globalAlpha = isSelected || $settings.visibility[connection.type] ? 1 : 0.1;

			drawArrow(
				connection.skills[0].pos,
				connection.skills[1].pos,
				connection.type,
				connection.direction,
				isSelected
			);
			ctx.globalAlpha = 1;
		}

		if(previousSkill !== null){
			drawArrow(
				previousSkill.pos,
				transformedMouse,
				$state.selectedConnectionType,
				$state.selectedConnectionDirection,
				false
			);
		}
	}

	function drawArrow(start: editor.Position, end: editor.Position, type: editor.ConnectionType, direction: editor.ConnectionDirection, isSelected: boolean){
		ctx.beginPath();

		ctx.moveTo(start.x, start.y);
		ctx.lineTo(end.x, end.y);

		if (isSelected) {
			ctx.setLineDash([3, 3]);
			ctx.strokeStyle = $theme["editor-selection-border-color"];
			ctx.lineWidth = 3 + 4;
			ctx.stroke();
		}

		switch(type){
		case editor.ConnectionType.NORMAL:
			ctx.strokeStyle = $theme["editor-normal-connection-color"];
			break;
		case editor.ConnectionType.EXCLUSIVE:
			ctx.strokeStyle = $theme["editor-exclusive-connection-color"];
			break;
		}

		ctx.lineWidth = 3;
		ctx.setLineDash([]);
		ctx.stroke();

		if (isSelected) {
			ctx.strokeStyle = $theme["editor-selection-background-color"];
			ctx.lineWidth = 3 + 2;
			ctx.stroke();
		}

		if (direction === editor.ConnectionDirection.UNIDIRECTIONAL) {
			switch(type){
			case editor.ConnectionType.NORMAL:
				ctx.fillStyle = $theme["editor-normal-connection-color"];
				break;
			case editor.ConnectionType.EXCLUSIVE:
				ctx.fillStyle = $theme["editor-exclusive-connection-color"];
				break;
			}

			const centerX = (start.x + end.x) / 2;
			const centerY = (start.y + end.y) / 2;
			let normalX = end.x - start.x;
			let normalY = end.y - start.y;
			const normalLength = Math.sqrt(normalX * normalX + normalY * normalY);
			normalX /= normalLength;
			normalY /= normalLength;
			const forwardX = normalX * 8;
			const forwardY = normalY * 8;
			const backwardX = forwardX / -2;
			const backwardY = forwardY / -2;
			const backX = centerX + backwardX;
			const backY = centerY + backwardY;
			const sideX = backwardY * Math.sqrt(3);
			const sideY = -backwardX * Math.sqrt(3);

			ctx.beginPath();
			ctx.moveTo(centerX + forwardX, centerY + forwardY);
			ctx.lineTo(backX - sideX, backY - sideY);
			ctx.lineTo(backX + sideX, backY + sideY);
			ctx.closePath();
			ctx.fill();

			if (isSelected) {
				ctx.fillStyle = $theme["editor-selection-background-color"];
				ctx.fill();
			}
		}
	}

	function addDot(x: number, y: number){
		addCircle(
			x * $grid.spacing,
			y * $grid.spacing,
			x === 0 && y === 0 ? 8 : 5
		);
	}

	function addCircle(x: number, y: number, r: number){
		ctx.moveTo(x + r, y);
		ctx.arc(x, y, r, 0, Math.PI * 2);
	}

	$: {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		($grid, $project, $state, $theme);

		if(ctx !== undefined){
			draw();
		}
	}
</script>

<svelte:window on:resize={resize} on:keyup={keyUp}/>

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
		flex: 1 auto;
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