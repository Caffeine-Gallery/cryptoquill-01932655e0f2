import { backend } from "declarations/backend";

let quill;
const modal = document.getElementById('newPostModal');
const newPostBtn = document.getElementById('newPostBtn');
const cancelBtn = document.getElementById('cancelBtn');
const postForm = document.getElementById('postForm');
const postsContainer = document.getElementById('posts');
const loadingElement = document.getElementById('loading');

// Initialize Quill editor
window.addEventListener('DOMContentLoaded', () => {
    quill = new Quill('#editor', {
        theme: 'snow',
        placeholder: 'Write your post content...',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });
});

// Modal controls
newPostBtn.onclick = () => modal.style.display = "block";
cancelBtn.onclick = () => modal.style.display = "none";
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

// Form submission
postForm.onsubmit = async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const body = quill.root.innerHTML;

    // Show loading state
    const submitBtn = postForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Publishing...';
    submitBtn.disabled = true;

    try {
        await backend.createPost(title, body, author);
        modal.style.display = "none";
        postForm.reset();
        quill.setContents([]);
        loadPosts();
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post. Please try again.');
    } finally {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
};

// Load and display posts
async function loadPosts() {
    loadingElement.style.display = 'block';
    postsContainer.innerHTML = '';

    try {
        const posts = await backend.getPosts();
        loadingElement.style.display = 'none';

        posts.forEach(post => {
            const article = document.createElement('article');
            article.className = 'post';
            
            const date = new Date(Number(post.timestamp) / 1000000); // Convert nanoseconds to milliseconds
            
            article.innerHTML = `
                <h2>${post.title}</h2>
                <div class="post-meta">
                    <span class="author">${post.author}</span>
                    <span class="date">${date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</span>
                </div>
                <div class="post-content">${post.body}</div>
            `;
            
            postsContainer.appendChild(article);
        });

        if (posts.length === 0) {
            postsContainer.innerHTML = '<p class="no-posts">No posts yet. Be the first to write something!</p>';
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        loadingElement.style.display = 'none';
        postsContainer.innerHTML = '<p class="error">Failed to load posts. Please refresh the page.</p>';
    }
}

// Initial load
loadPosts();
