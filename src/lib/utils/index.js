export const fetchProjectMarkdownPosts = async () => {
    const allProjectPosts = import.meta.glob('/src/routes/projects/*.md');
    const iterablePostFiles = Object.entries(allProjectPosts);

    const allPosts = await Promise.all(
        iterablePostFiles.map(async ([path, resolver]) => {
            const { metadata } = await resolver();
            const postPath = path.slice(11, -3);

            return {
                meta: metadata,
                path: postPath
            };
        })
    );

    return allPosts;
};

export const fetchBlogMarkdownPosts = async () => {
    const allBlogPosts = import.meta.glob('/src/routes/blog/*.md');
    const iterablePostFiles = Object.entries(allBlogPosts);

    const allPosts = await Promise.all(
        iterablePostFiles.map(async ([path, resolver]) => {
            const { metadata } = await resolver();
            const postPath = path.slice(11, -3);

            return {
                meta: metadata,
                path: postPath
            };
        })
    );

    return allPosts;
};