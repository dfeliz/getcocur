
function mapToSlugArray(eventList) {
    console.log(eventList);
    const slugs = [];
    for(let event of eventList) {
        slugs.push(event.slug);
    }
    return slugs;
};

module.exports = {
    mapToSlugArray,
}
