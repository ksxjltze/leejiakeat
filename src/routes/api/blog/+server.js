import { fetchBlogMarkdownPosts } from "$lib/utils";
import { json } from "@sveltejs/kit";

export const GET = async () => {
    const allPosts = await fetchBlogMarkdownPosts();
    const sortedPosts = allPosts.sort((a, b)=>{
        let date_time_a = new Date(a.meta.date).getTime();
        let date_time_b = new Date(b.meta.date).getTime();

        return date_time_b - date_time_a;
    });

    return json(sortedPosts);
};