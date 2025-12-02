// src/pages/sharedPages/blog/components/BlogPostCard.tsx
import { Link } from 'react-router-dom';

type Post = {
  title: string;
  slug: string;
  excerpt: string;
  thumbnail_url: string | null;
  published_at: string;
};

export default function BlogPostCard({ post }: { post: Post }) {
  const date = new Date(post.published_at).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <Link to={`/blog/${post.slug}`} className="block group">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">

        {/* Zdjęcie – zawsze na górze na mobile, obok na desktopie */}
        {post.thumbnail_url ? (
          <div className="relative aspect-video md:aspect-auto">
            <img 
              src={post.thumbnail_url} 
              alt={post.title}
              className="w-full h-full object-cover md:h-64 md:w-96 lg:w-full lg:h-80"
            />
            {/* Delikatny overlay przy hover */}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-64 md:h-64 md:w-96 lg:h-80 flex items-center justify-center">
            <span className="text-gray-500 text-lg font-medium">Brak zdjęcia</span>
          </div>
        )}

        {/* Treść – zawsze pod zdjęciem na mobile */}
        <div className="p-6 md:p-8 lg:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-purple-800 group-hover:text-purple-600 transition-colors duration-300 line-clamp-2">
            {post.title}
          </h2>

          <p className="text-gray-500 text-sm md:text-base mt-2 font-medium">
            {date}
          </p>

          <p className="text-gray-700 mt-4 text-base md:text-lg leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>

          <div className="mt-6 flex items-center text-purple-600 font-bold group-hover:underline">
            Czytaj dalej
            <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}