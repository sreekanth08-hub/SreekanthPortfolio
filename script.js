/**
 * Modern Personal Developer Portfolio — Sreekanth Damodar
 * Interactive Scripts & Micro-Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. Typing Animation Effect (Hero Section)
  // --------------------------------------------------------------------------
  const typingElement = document.getElementById('typing-text');
  const roles = [
    'Python Full Stack Developer',
    'Web Developer'
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingDelay = 120;
  let deletingDelay = 60;
  let holdDelay = 1800; // Hold full text before deleting

  function typeEffect() {
    if (!typingElement) return;

    const currentRole = roles[roleIndex];

    if (isDeleting) {
      typingElement.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typingElement.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
    }

    let timeout = isDeleting ? deletingDelay : typingDelay;

    if (!isDeleting && charIndex === currentRole.length) {
      // Finished typing current string, pause
      timeout = holdDelay;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      // Finished deleting, switch to next string
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      timeout = 400; // Short pause before typing next
    }

    setTimeout(typeEffect, timeout);
  }

  typeEffect();

  // --------------------------------------------------------------------------
  // 2. Navigation Bar (Sticky, Active Highlight, Mobile Drawer)
  // --------------------------------------------------------------------------
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  // Sticky header background on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile Drawer Open / Close
  function openMobileNav() {
    mobileNav.classList.add('open');
    drawerBackdrop.classList.add('active');
    mobileNav.setAttribute('aria-hidden', 'false');
    drawerBackdrop.setAttribute('aria-hidden', 'false');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    mobileNav.classList.remove('open');
    drawerBackdrop.classList.remove('active');
    mobileNav.setAttribute('aria-hidden', 'true');
    drawerBackdrop.setAttribute('aria-hidden', 'true');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileNav);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeMobileNav);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeMobileNav);

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  // Active Link Highlighting using IntersectionObserver
  const sections = document.querySelectorAll('section[id], header[id="top"]');
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const href = link.getAttribute('href').replace('#', '');
          if (href === id || (id === 'top' && href === 'top')) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => navObserver.observe(sec));

  // --------------------------------------------------------------------------
  // 3. AI Video Greeting Player Interface
  // --------------------------------------------------------------------------
  const video = document.getElementById('ai-greeting-video');
  const videoOverlay = document.getElementById('video-overlay');
  const playPauseBtn = document.getElementById('ctrl-play-pause');
  const iconPlay = playPauseBtn ? playPauseBtn.querySelector('.icon-play') : null;
  const iconPause = playPauseBtn ? playPauseBtn.querySelector('.icon-pause') : null;
  const timelineWrap = document.getElementById('ctrl-timeline-wrap');
  const progressBar = document.getElementById('ctrl-progress-bar');
  const timeText = document.getElementById('ctrl-time-text');
  const speakBtn = document.getElementById('ctrl-speak-btn');
  const fullscreenBtn = document.getElementById('ctrl-fullscreen');
  const videoWrapper = document.getElementById('video-wrapper');

  function togglePlayState() {
    if (!video) return;

    if (video.paused || video.ended) {
      video.play().then(() => {
        if (videoOverlay) videoOverlay.classList.add('hidden');
        if (iconPlay) iconPlay.style.display = 'none';
        if (iconPause) iconPause.style.display = 'block';
      }).catch(err => {
        console.warn('Playback prevented or file absent:', err);
      });
    } else {
      video.pause();
      if (videoOverlay) videoOverlay.classList.remove('hidden');
      if (iconPlay) iconPlay.style.display = 'block';
      if (iconPause) iconPause.style.display = 'none';
    }
  }

  if (videoOverlay) videoOverlay.addEventListener('click', togglePlayState);
  if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlayState);

  // Time & Progress Update
  if (video) {
    video.addEventListener('timeupdate', () => {
      if (video.duration) {
        const percent = (video.currentTime / video.duration) * 100;
        if (progressBar) progressBar.style.width = `${percent}%`;

        const curMin = Math.floor(video.currentTime / 60);
        const curSec = Math.floor(video.currentTime % 60).toString().padStart(2, '0');
        const durMin = Math.floor(video.duration / 60);
        const durSec = Math.floor(video.duration % 60).toString().padStart(2, '0');
        if (timeText) timeText.textContent = `${curMin}:${curSec} / ${durMin}:${durSec}`;
      }
    });

    video.addEventListener('ended', () => {
      if (videoOverlay) videoOverlay.classList.remove('hidden');
      if (iconPlay) iconPlay.style.display = 'block';
      if (iconPause) iconPause.style.display = 'none';
    });
  }

  // Seek Timeline
  if (timelineWrap && video) {
    timelineWrap.addEventListener('click', (e) => {
      const rect = timelineWrap.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      if (video.duration) {
        video.currentTime = pos * video.duration;
      }
    });
  }

  // Voice Speech Synthesizer Greeting Trigger
  function playVoiceGreeting() {
    const greetingText = "Hi, I'm Sreekanth Damodar. Welcome to my portfolio!";
    if ('speechSynthesis' in window) {
      // Cancel previous utterances
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(greetingText);
      utterance.pitch = 1.0;
      utterance.rate = 0.95;
      
      // Try to select an English voice
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.includes('en'));
      if (englishVoice) utterance.voice = englishVoice;

      window.speechSynthesis.speak(utterance);
      showToast("🔊 Playing Voice Greeting...");
    } else {
      showToast("Voice synthesizer not supported in this browser.");
    }
  }

  if (speakBtn) speakBtn.addEventListener('click', playVoiceGreeting);

  // Fullscreen Toggle
  if (fullscreenBtn && videoWrapper) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        videoWrapper.requestFullscreen().catch(err => {
          console.warn('Fullscreen request failed:', err);
        });
      } else {
        document.exitFullscreen();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 4. Project Overview Modal Dialogs
  // --------------------------------------------------------------------------
  const projectModal = document.getElementById('project-modal');
  const modalTitle = document.getElementById('modal-project-title');
  const modalBody = document.getElementById('modal-project-body');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalDismissBtn = document.getElementById('modal-dismiss-btn');
  const previewButtons = document.querySelectorAll('.btn-project-preview');

  const projectDetails = {
    'medical-chatbot': {
      title: 'AI Medical Chatbot for Emergency Medical Assistance',
      content: `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <p><strong>Overview:</strong> A multimodal healthcare triage backend and client designed to assist patients in emergency situations with immediate, reliable first-line guidance.</p>
          
          <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:10px; border:1px solid rgba(255,255,255,0.08);">
            <h4 style="color:#00F5D4; margin-bottom:8px; font-size:0.95rem;">System Architecture:</h4>
            <ul style="padding-left:18px; margin:0; display:flex; flex-direction:column; gap:6px; font-size:0.9rem;">
              <li><strong>Natural Language Processing (NLP):</strong> Tokenizes user input, extracts clinical entities, and maps symptoms against medical datasets.</li>
              <li><strong>Computer Vision (CNN):</strong> Deep convolutional neural network analyzing user-submitted images (e.g., rashes, wound severity) for preliminary anomaly classification.</li>
              <li><strong>Audio/Speech Transcription:</strong> Converts emergency vocal recordings to text queries for hands-free assistance.</li>
              <li><strong>Unified Pipeline:</strong> Merges findings across speech, vision, and text into structured, prioritized clinical recommendations.</li>
            </ul>
          </div>

          <p><strong>Primary Tech Stack:</strong> Python, Natural Language Processing (NLP), Convolutional Neural Networks (CNN), SpeechRecognition, OpenCV, REST API.</p>
          <p><strong>Impact:</strong> Demonstrates real-world integration of multiple AI modalities to solve critical medical response bottlenecks.</p>
        </div>
      `
    },
    'food-ordering': {
      title: 'Foodie Hub – Online Food Ordering Web Application',
      content: `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <p><strong>Overview:</strong> A responsive web application developed using HTML, CSS, and JavaScript to simplify online food browsing and ordering, featuring interactive menus, food search, category filtering, and shopping cart management.</p>
          
          <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:10px; border:1px solid rgba(255,255,255,0.08);">
            <h4 style="color:#00F5D4; margin-bottom:8px; font-size:0.95rem;">Key Technical Highlights:</h4>
            <ul style="padding-left:18px; margin:0; display:flex; flex-direction:column; gap:8px; font-size:0.9rem;">
              <li><strong>Dynamic Food Menu:</strong> Displayed food items with images, prices, ratings, and categories using reusable JavaScript functions.</li>
              <li><strong>Cart Management:</strong> Implemented add-to-cart, quantity updates, item removal, and automatic price calculations.</li>
              <li><strong>Search &amp; Filtering:</strong> Enabled users to search food items and filter menus by category for easier navigation.</li>
              <li><strong>Persistent Data Storage:</strong> Used browser LocalStorage to retain cart items across page refreshes.</li>
              <li><strong>Responsive UI Design:</strong> Created a user-friendly interface that adapts to desktop, tablet, and mobile screens.</li>
            </ul>
          </div>

          <p><strong>Technologies:</strong> HTML5, CSS3, JavaScript, LocalStorage</p>
          <p><em>Note: Strictly includes features actually implemented in the project.</em></p>
        </div>
      `
    }
  };

  function openProjectModal(projectKey) {
    const data = projectDetails[projectKey];
    if (!data) return;

    modalTitle.textContent = data.title;
    modalBody.innerHTML = data.content;
    projectModal.classList.add('open');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    projectModal.classList.remove('open');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  previewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const proj = btn.getAttribute('data-project');
      openProjectModal(proj);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);
  if (modalDismissBtn) modalDismissBtn.addEventListener('click', closeProjectModal);
  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) closeProjectModal();
    });
  }

  // Close modal on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal && projectModal.classList.contains('open')) {
      closeProjectModal();
    }
  });

  // --------------------------------------------------------------------------
  // 5. Copy to Clipboard Utility
  // --------------------------------------------------------------------------
  const copyButtons = document.querySelectorAll('.copy-btn');
  const toast = document.getElementById('toast');
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied to clipboard: ${textToCopy}`);
        }).catch(err => {
          console.error('Clipboard copy error:', err);
          showToast(`Selected: ${textToCopy}`);
        });
      }
    });
  });

  // --------------------------------------------------------------------------
  // 6. Real Email Delivery via FormSubmit (to dsrikanth901@gmail.com)
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const nameInput = document.getElementById('form-name');
  const emailInput = document.getElementById('form-email');
  const subjectInput = document.getElementById('form-subject');
  const messageInput = document.getElementById('form-message');
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      let isValid = true;

      // Clear previous error messages
      if (nameError) nameError.textContent = '';
      if (emailError) emailError.textContent = '';
      if (messageError) messageError.textContent = '';
      if (formStatus) formStatus.style.display = 'none';

      // Validate Name
      const nameVal = nameInput.value.trim();
      if (!nameVal) {
        if (nameError) nameError.textContent = 'Please enter your name.';
        isValid = false;
      }

      // Validate Email
      const emailVal = emailInput.value.trim();
      if (!emailVal) {
        if (emailError) emailError.textContent = 'Please enter your email address.';
        isValid = false;
      } else if (!validateEmail(emailVal)) {
        if (emailError) emailError.textContent = 'Please enter a valid email address.';
        isValid = false;
      }

      // Validate Message
      const messageVal = messageInput.value.trim();
      if (!messageVal) {
        if (messageError) messageError.textContent = 'Please enter a message.';
        isValid = false;
      }

      if (!isValid) return;

      const subjectVal = (subjectInput && subjectInput.value.trim()) ? subjectInput.value.trim() : 'New Portfolio Contact';

      const submitBtn = document.getElementById('form-submit-btn');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span>Delivering message...</span>`;
      submitBtn.disabled = true;

      try {
        // Send real email via FormSubmit AJAX endpoint to dsrikanth901@gmail.com
        const response = await fetch('https://formsubmit.co/ajax/dsrikanth901@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: nameVal,
            email: emailVal,
            _subject: `Portfolio Message: ${subjectVal}`,
            message: messageVal,
            _template: 'table'
          })
        });

        const result = await response.json();

        if (response.ok && (result.success === 'true' || result.success === true || result.message)) {
          formStatus.className = 'form-status-alert alert-success';
          formStatus.innerHTML = `✓ <strong>Thank you, ${nameVal}!</strong> Your message has been sent successfully to <strong>dsrikanth901@gmail.com</strong>. Sreekanth will reply to your email shortly!`;
          formStatus.style.display = 'block';
          showToast("✓ Message delivered to Sreekanth's inbox!");
          contactForm.reset();
        } else {
          throw new Error(result.message || 'Server returned non-ok status');
        }
      } catch (err) {
        console.warn('FormSubmit AJAX attempt error, opening mailto fallback:', err);
        // Direct mailto fallback so the email is NEVER lost
        const mailtoUrl = `mailto:dsrikanth901@gmail.com?subject=${encodeURIComponent(subjectVal)}&body=${encodeURIComponent("From: " + nameVal + " (" + emailVal + ")\n\n" + messageVal)}`;
        
        formStatus.className = 'form-status-alert alert-success';
        formStatus.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:8px;">
            <span>✓ Prepared your message for <strong>dsrikanth901@gmail.com</strong>.</span>
            <a href="${mailtoUrl}" class="btn btn-outline btn-xs" style="align-self:center; margin-top:4px;">
              🚀 Click here to launch email client directly
            </a>
          </div>
        `;
        formStatus.style.display = 'block';
        window.location.href = mailtoUrl;
        showToast("Opening email application...");
      } finally {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  }

  // --------------------------------------------------------------------------
  // 7. Dynamic Footer Year
  // --------------------------------------------------------------------------
  const currentYearSpan = document.getElementById('current-year');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }
});
