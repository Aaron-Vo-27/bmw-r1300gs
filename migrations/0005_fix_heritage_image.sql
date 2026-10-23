update models
set hero_image = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1600&q=80'
where id in ('md-r18', 'md-r18c');

update versions
set hero_image = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1400&q=80'
where id = 'vr-r18b';
