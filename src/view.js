import onChange from 'on-change';
import { setLocale } from 'yup';

export default (state, i18nInstance) => {
  setLocale({
    string: {
      url: i18nInstance.t('feedback.invalidUrl'),
    },
    mixed: {
      default: i18nInstance.t('feedback.duplicate'),
    },
  });

  const form = document.querySelector('.rss-form');
  const submitButton = document.querySelector('button[type="submit"]');
  const divFeedBack = document.querySelector('.feedback');
  const input = document.querySelector('.rss-form input');

  const renderFeedback = (value, style) => {
    divFeedBack.classList.remove('text-success', 'text-danger');
    divFeedBack.classList.add(style);
    divFeedBack.textContent = value;
  };

  const renderFeeds = (feeds) => {
    const feedsContainer = document.querySelector('.feeds');
    const ulfeed = document.createElement('ul');
    ulfeed.classList.add('list-group', 'mb-5');
    const feedsContent = feeds.map((feed) => `
      <li class="list-group-item">
        <h3>${feed.title}</h3>
        <p>${feed.description}</p>
      </li>`);
    ulfeed.innerHTML = feedsContent.join('');
    feedsContainer.innerHTML = `<h2>Фиды</h2>${ulfeed.outerHTML}`;
  };

  const renderModal = (content, link, postState) => {
    link.classList.remove('font-weight-bold', 'font-weight-normal');

    if (postState === 'active') {
      link.classList.add('font-weight-bold');
    }
    if (postState === 'inactive') {
      link.classList.add('font-weight-normal');
    }
    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');
    const modalLink = document.querySelector('.full-article');
    modalTitle.textContent = content.postTitle;
    modalBody.textContent = content.postDescription;
    modalLink.setAttribute('href', content.link);
  };

  const renderPosts = (posts) => {
    const postsContainer = document.querySelector('.posts');
    const ulpost = document.createElement('ul');
    ulpost.classList.add('list-group');

    posts.map((post) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
      const a = document.createElement('a');
      const btn = document.createElement('button');

      if (post.state === 'active') {
        a.classList.add('font-weight-bold');
      }
      if (post.state === 'inactive') {
        a.classList.add('font-weight-normal');
      }

      a.setAttribute('href', `${post.link}`);
      a.setAttribute('data-id', `${post.id}`);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      a.textContent = post.postTitle;
      btn.classList.add('btn', 'btn-primary', 'btn-sm');
      btn.setAttribute('type', 'button');
      btn.setAttribute('data-id', `${post.id}`);
      btn.setAttribute('data-bs-toggle', 'modal');
      btn.setAttribute('data-bs-target', '#modal');
      btn.textContent = 'Просмотр';
      btn.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        const currentPost = posts.find((el) => el.id === id);
        currentPost.state = 'inactive';
        renderModal(post, a, currentPost.state);
      });
      li.appendChild(a);
      li.appendChild(btn);

      return li;
    }).map((li) => ulpost.appendChild(li));
    postsContainer.innerHTML = '';
    postsContainer.innerHTML = '<h2>Посты</h2>';
    postsContainer.appendChild(ulpost);
  };

  const processStateHandle = (processState, watchedState) => {
    if (input.hasAttribute('readonly')) {
      input.removeAttribute('readonly', '');
    }
    if (processState === 'pending') { // switch
      submitButton.disabled = false;
    } else if (processState === 'sending') {
      input.setAttribute('readonly', '');
      submitButton.disabled = true;
    } else if (processState === 'finished') {
      submitButton.disabled = false;
      renderFeedback(i18nInstance.t(watchedState.formState.processSucces), 'text-success');
      form.reset();
    } else if (processState === 'failed') {
      submitButton.disabled = false;
      renderFeedback(i18nInstance.t(watchedState.formState.processError), 'text-danger');
    }
  };

  const watchedState = onChange(state, (path, value) => {
    if (path === 'formState.processState') {
      processStateHandle(value, watchedState);
    }
    if (path === 'formState.valid') {
      if (!value) {
        divFeedBack.classList.add('text-danger');
        input.classList.add('is-invalid');
        divFeedBack.textContent = i18nInstance.t(watchedState.formState.validError);
      }
      if (value) {
        input.classList.remove('is-invalid');
      }
    }
    if (path === 'posts') {
      renderPosts(watchedState.posts);
    }
    if (path === 'feeds') {
      renderFeeds(watchedState.feeds);
    }
  });
  return watchedState;
};
