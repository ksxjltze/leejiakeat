import { fetchProjectMarkdownPosts } from "$lib/utils";
import { json } from "@sveltejs/kit";

export const GET = async () => {
    const allPosts = await fetchProjectMarkdownPosts();
    const sortedPosts = allPosts.sort((a, b)=>{
        return new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime();
    });

    return json(sortedPosts);
};