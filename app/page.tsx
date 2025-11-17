// app/page.tsx

export default function HomePage() {
  return (
    <div className="flex gap-14">
      
      {/* LEFT - Articles */}
      <div className="flex-1">
        <section className="mb-16">
          <h1 className="text-5xl font-extrabold mb-4 leading-tight text-[#1A3D2F]">
            Ideas & Stories  
            <br />
            from Aurie’s Community
          </h1>

          <p className="text-xl text-[#3D5A48]">
            Explore powerful articles written by the community.  
            Your medium, your voice.
          </p>
        </section>

        {/* Articles list */}
        <div className="space-y-10">
          {[1, 2, 3].map((item) => (
            <article
              key={item}
              className="bg-white rounded-xl p-6 border border-[#E0D8CC]"
            >
              <h2 className="text-2xl font-bold mb-2">
                Example Article #{item}
              </h2>
              <p className="text-[#5E7B6F]">
                This is a placeholder article description. Once we connect Firebase,
                we will show real articles here.
              </p>
            </article>
          ))}
        </div>
      </div>

      {/* RIGHT - Sidebar */}
      <aside className="w-64 hidden md:block">
        <h3 className="text-xl font-bold mb-6 text-[#1A3D2F]">Trending Topics</h3>

        <div className="flex flex-col gap-3 text-[#3D5A48]">
          <span>#Tech</span>
          <span>#Development</span>
          <span>#Life</span>
          <span>#Design</span>
          <span>#Business</span>
        </div>
      </aside>
    </div>
  );
}
