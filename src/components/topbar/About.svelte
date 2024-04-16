<script>
  let about_in_view = false;
</script>

<button
  id="about_text"
  class="text_level1 noselect"
  style="color:{about_in_view ? 'white' : ''}"
  on:click={() => {
    about_in_view = !about_in_view;
  }}><span> about </span></button
>

{#if about_in_view}
  <div class="modal_container">
    <div class="box modal_content text_level3" id="about_modal">
      <div style="color:white">
        <div>
          <div class="text_level1">DESCRIPTION</div>
          <p>
            A response to the deluge of visual information flowing out of
            conflict environments and contested events, Codec is designed to
            support the work of researchers, journalists, legal teams, activist
            groups and others in adjacent fields. While the tool has many
            potential applications, the driving goal has been to further
            investigations, amplify truth, and pursue accountability for human
            rights abuses. The interface is a modular system split into three
            components: a timeline, a map, and a media player that allows users
            to securely synthesize large data sets of multimedia assets across
            the time and space of an event or series of events.
          </p>

          <p>
            Codec originally emerged as a byproduct of attempting to solve
            recurring challenges in our investigative workflows—issues around
            collaboration, rapid visualization, and the management of video
            evidence. While the amount of user-generated content has increased
            exponentially in recent years, managing the sheer volume of material
            can become inefficient at best and, often, simply prohibitive. Codec
            is designed to make this process collaborative, streamlined,
            efficient and intuitive. Research and development for this beta
            version unfolded across various cases, and through collaborating
            with partners including: Carnegie Mellon University’s Center for
            Human Rights Science, Amnesty International, UC Berkeley's Human
            Rights Center, Columbia Law School’s Human Rights Initiative, Human
            Rights Watch, UNITAD and many more.
          </p>
        </div>
        <div>
          <div class="text_level1">CONTACT</div>
          <p>
            If you'd like to work with us on using or developing Codec, please
            fill out <a
              href="https://forms.gle/7Pg7GPZmYpN6CVSa9"
              target="_blank"
              rel="noopener noreferrer">this form</a
            >. Otherwise, send us an email at codec@situ.nyc. As a small team,
            we won't be able to work with all collaborators, but we will do our
            best to support serious inquiries. We have written out detailed
            instructions on
            <a
              href="https://github.com/SITU-Research/codec"
              target="_blank"
              rel="noopener noreferrer">GitHub</a
            > to help you get started without the need for direct communication.
          </p>

          <p style="color:var(--grey2)">
            For non-commercial projects or entities, Mapbox may be able to
            provide account support and discounts. Contact community@mapbox.com
            to describe your Codec use case and request Mapbox account support.
          </p>

          <p style="color:var(--grey2)">
            Graphic identity and UI consultancy by <a
              href="https://scasascia.com/"
              target="_blank"
              rel="noopener noreferrer">Studio Scasascia</a
            >.
          </p>

          <p style="color:var(--grey2)">
            <a
              href="https://choosealicense.com/licenses/agpl-3.0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              License
            </a>
          </p>
        </div>
      </div>
      <span on:click={() => (about_in_view = false)} id="about_close_button"
        >&#215;</span
      >
    </div>
  </div>
{/if}

<style>
  #about_text {
    color: var(--grey2);
    text-align: center;
    margin-left: auto;
  }

  span {
    display: inline-block;
    vertical-align: middle;
    line-height: normal;
    padding: 1px 0;
  }

  #about_modal {
    display: flex;
    flex-flow: row nowrap;
    padding: var(--grid-size);
  }

  #about_modal > div {
    flex-grow: 1;
    display: flex;
    flex-flow: row wrap;
  }

  #about_modal > div > div {
    flex: 1 1 350px;
    margin-right: var(--grid-size);
  }

  #about_close_button {
    cursor: pointer;
    color: white;
  }
</style>
