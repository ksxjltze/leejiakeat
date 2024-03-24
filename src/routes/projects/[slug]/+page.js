// src/routes/blog/[slug]/+page.js
export async function load({params}) {
    const post = await import(`../${params.slug}.md`);
    const {
        layout, 
        title, 
        permalink, 
        engine, 
        background,

        date, 
        endDate,

        academic,
        school,
        module,

        description, 
        iconSrc
    } = post.metadata;
    const content = post.default;

    return {
        content,
        title,
        date
    }
}