// Подгружаем репозитории пользователя GitHub и рендерим карточки
const GITHUB_USER = 'artur458';
const reposContainer = document.getElementById('repos');

function createRepoCard(repo){
  const div = document.createElement('div');
  div.className = 'card';
  const name = document.createElement('h3');
  const a = document.createElement('a');
  a.href = repo.html_url;
  a.target = '_blank';
  a.rel = 'noopener';
  a.textContent = repo.name;
  a.style.color = 'var(--text)';
  a.style.textDecoration = 'none';
  name.appendChild(a);

  const desc = document.createElement('p');
  desc.className = 'repo-desc';
  desc.textContent = repo.description || '';

  const meta = document.createElement('div');
  meta.className = 'repo-meta';
  const lang = document.createElement('div');
  lang.className = 'muted';
  lang.textContent = repo.language || '';
  const stars = document.createElement('div');
  stars.className = 'repo-stars';
  stars.innerHTML = `<i class="fa fa-star"></i> ${repo.stargazers_count}`;

  meta.appendChild(lang);
  meta.appendChild(stars);

  div.appendChild(name);
  if(desc.textContent) div.appendChild(desc);
  div.appendChild(meta);
  return div;
}

async function loadRepos(){
  try{
    reposContainer.innerHTML = '<div class="muted">Загрузка...</div>';
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=50&sort=updated`);
    if(!res.ok) throw new Error('GitHub API error');
    const repos = await res.json();
    reposContainer.innerHTML = '';
    if(repos.length===0){
      reposContainer.innerHTML = '<div class="muted">Репозиториев не найдено.</div>';
      return;
    }
    // Фильтруем: показываем только не-архивные и сортируем по звёздам+обновлению
    repos.sort((a,b)=>{
      const scoreA = (a.stargazers_count||0)*10 + new Date(a.updated_at).getTime()/1e13;
      const scoreB = (b.stargazers_count||0)*10 + new Date(b.updated_at).getTime()/1e13;
      return scoreB-scoreA;
    });
    // Отрендерить первые 12
    repos.slice(0,12).forEach(r=>{
      reposContainer.appendChild(createRepoCard(r));
    });
  }catch(err){
    reposContainer.innerHTML = `<div class="muted">Не удалось загрузить репозитории: ${err.message}</div>`;
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  if(reposContainer) loadRepos();
  // Reveal animation for sections/cards
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting) e.target.classList.add('active');
    });
  },{threshold:0.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  document.querySelectorAll('.card').forEach(el=>io.observe(el));
});
