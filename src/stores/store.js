import { writable, derived } from "svelte/store";

export const media_store = writable({})
export const local_file_store = writable({})
export const events_store = writable([])
export const platform_config_store = writable({})


export const ui_store = writable({
    modules_in_view: ['timeline','map', 'media'],
    media_in_view: [],
    media_hovered: [],
    filter_in_view: false,
})

export const filter_toggles = writable({
    "include all": true,
});

export const media_store_filtered = derived([filter_toggles, media_store], ([$filter_toggles, $media_store]) => {
    // for each medium
    let filtered_media = Object.keys($media_store).filter((UAR) => {
        let medium = $media_store[UAR]
        // build an array with an item
        // for each on property, ie we want to see any video that has at least this property
        let some_properties_matches = Object.keys($filter_toggles)
            .some(filter => {
                let filter_value = $filter_toggles[filter]
                if (filter == 'include all') {
                    return filter_value // if include all is on then pretend like its a property match
                } else if (medium[filter] == undefined) {
                    return false
                } else if (typeof filter_value !== 'object') {
                    return medium[filter] && filter_value
                } else {
                    return Object.keys(filter_value).filter((subtoggle) => filter_value[subtoggle]).some((subtoggle) => {
                        return medium[filter].includes(subtoggle)
                    })
                }


            })
        return some_properties_matches
    }).map((UAR) => [UAR, $media_store[UAR]])
    return Object.fromEntries(filtered_media)
})