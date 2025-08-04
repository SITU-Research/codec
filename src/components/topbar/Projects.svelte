<script>
  let projects_in_view = true;
  let projects = [
    {
      "name":"A",
      "description":"B",
			"last_edited": Date.now(),
			"filename":"file.codec"
    },
		{
			"name":"P2",
      "last_edited": Date.now(),
			"filename":"Path/To/Other/File.codec"
		}
  ];
</script>

<button
  id="project-manager"
  class="box text_level1 noselect"
  style="color:{projects_in_view ? 'white' : ''}"
  on:click={() => {
    projects_in_view = !projects_in_view;
  }}><span> projects </span></button
>

{#if projects_in_view}
  <div class="modal_container">
    <div class="box modal_content text_level3" id="projects_modal">
      <div style="color:white;">
				<div style="display:flex;">
					<span class="text_level1">PROJECTS</span>
					<button class="t_button" style='margin: 0 4px 0 auto;'>Import</button>
					<button class="t_button">Create</button>
				</div>
				<ul style="padding-left:1em; padding-right:0; width:100%;">
					{#each projects as project, i}
						<li id="project{i}" style="display:flex;">
							<div>
								<span>Project: {project.name}</span>
								<span style="font-size: 0.75em;">Last edited: 
									{new Date(project.last_edited).toLocaleTimeString()} 
									{new Date(project.last_edited).toLocaleDateString()}</span>
								<p style="font-size: 0.75em; margin:0;">{project.filename}</p>
							</div>
							<div style="margin-left:auto;">
								<button class="p_button">Load Project</button>	
								<button class="p_button">Delete Project</button>
							</div>
						</li>
					{/each}
				</ul>
      </div>
			<span on:click={() => (projects_in_view = false)} id="projects_close_button"
				>&#215;</span
			>
    </div>
  </div>
{/if}

<style>
  .p_button {
		margin-left:auto;
		background-color:white;
		color:black;
	}
  /* #about_text {
    color: var(--grey2);
    text-align: center;
    margin-left: auto;
  } */
  .t_button {
		background-color: rgba(255,255,255,0.3);
	}

	ul {
		margin-left:0;
	}
	
	li {
		display: inline-block;
		list-style:none;
		width: 100%;
		/* padding: 4px; */
		background-color: rgba(0.9, 0.9, 0.9, 0.7);
		border-bottom: 0.5px;
		border-style: none none solid none;
	}

  span {
    display: inline-block;
    vertical-align: middle;
    line-height: normal;
    padding: 1px 0;
  }

  #projects_modal {
    display: flex;
    flex-flow: row nowrap;
    padding: var(--grid-size);
  }

  #projects_modal > div {
    flex-grow: 1;
    display: flex;
    flex-flow: row wrap;
  }

  #projects_modal > div > div {
    flex: 1 1 350px;
    margin-right: var(--grid-size);
  }

  #projects_close_button {
    cursor: pointer;
    color: white;
  }
</style>
