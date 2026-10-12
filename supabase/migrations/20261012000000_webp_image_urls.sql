-- Point stored local image paths to the WebP versions in public/images.
update public.products
set image_url = regexp_replace(image_url, '^(/images/[^/]+)\.(png|jpe?g)$', '\1.webp')
where image_url ~ '^/images/[^/]+\.(png|jpe?g)$';

update public.stories
set image_url = regexp_replace(image_url, '^(/images/[^/]+)\.(png|jpe?g)$', '\1.webp')
where image_url ~ '^/images/[^/]+\.(png|jpe?g)$';

update public.sponsors
set logo_url = regexp_replace(logo_url, '^(/images/[^/]+)\.(png|jpe?g)$', '\1.webp')
where logo_url ~ '^/images/[^/]+\.(png|jpe?g)$';
