-- The association is called "Sumando Vida" (singular). Fix the name in seeded public text.
update public.projects
set description = replace(description, 'Sumando Vidas', 'Sumando Vida')
where description like '%Sumando Vidas%';

update public.stories
set summary = replace(summary, 'Sumando Vidas', 'Sumando Vida')
where summary like '%Sumando Vidas%';
