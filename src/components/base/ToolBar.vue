<template>
    <v-chip class="ma-2" color="blue lighten-4" label style="font-size: 1.2rem;">
        <v-icon start icon="mdi-bookmark"></v-icon>
        {{ UpperCase(getTitle) }}
    </v-chip>
</template>

<script>

export default {
    data() {
        return {
        };
    },
    props: {
        getTitle: String
    },
    methods: {
        UpperCase(title) {
            title = title.toUpperCase()
            return title
        }
    }
}
</script>

