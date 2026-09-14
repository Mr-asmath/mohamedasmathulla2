document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle
  const themeToggleBtn = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme') || 'light';
  
  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeToggleBtn) themeToggleBtn.textContent = '☀️';
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      let theme = document.documentElement.getAttribute('data-theme');
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        themeToggleBtn.textContent = '🌙';
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.textContent = '☀️';
      }
    });
  }

  // Active Link Highlighting
  const currentLocation = location.href;
  const menuItems = document.querySelectorAll('.nav-links a');
  
  menuItems.forEach(item => {
    if (item.href === currentLocation) {
      item.classList.add('active');
    }
  });
});

// Scroll to Top Button
const scrollToTopBtn = document.getElementById('scrollToTop');
if(scrollToTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollToTopBtn.style.display = 'flex';
    } else {
      scrollToTopBtn.style.display = 'none';
    }
  });

  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// AI Chat Widget Logic
const aiChatToggle = document.getElementById('ai-chat-toggle');
const aiChatWindow = document.getElementById('ai-chat-window');
const aiChatClose = document.getElementById('ai-chat-close');
const aiChatMessages = document.getElementById('ai-chat-messages');
const aiChatInput = document.getElementById('ai-chat-input');
const aiChatSend = document.getElementById('ai-chat-send');

if (aiChatToggle) {
  aiChatToggle.addEventListener('click', () => {
    aiChatWindow.style.display = aiChatWindow.style.display === 'flex' ? 'none' : 'flex';
  });

  aiChatClose.addEventListener('click', () => {
    aiChatWindow.style.display = 'none';
  });

  const appendMessage = (text, sender) => {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('ai-message', sender);
    msgDiv.textContent = text;
    aiChatMessages.appendChild(msgDiv);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
  };

  const handleSend = async () => {
    const text = aiChatInput.value.trim();
    if (!text) return;
    
    appendMessage(text, 'user');
    aiChatInput.value = '';

    const typingDiv = document.createElement('div');
    typingDiv.classList.add('ai-message', 'bot', 'typing');
    typingDiv.textContent = 'Thinking...';
    aiChatMessages.appendChild(typingDiv);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await response.json();
      
      typingDiv.remove();
      if (data.reply) {
        appendMessage(data.reply, 'bot');
      } else {
        appendMessage('Sorry, I encountered an error.', 'bot');
      }
    } catch (error) {
      typingDiv.remove();
      appendMessage('Could not connect to the server (you may need to deploy this to Vercel first).', 'bot');
    }
  };

  aiChatSend.addEventListener('click', handleSend);
  aiChatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });
}

// Contact Form Logic
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const company = document.getElementById('company').value;
    const service = document.getElementById('service').value;
    const message = document.getElementById('message').value;

    // Update UI
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    formStatus.style.display = 'block';
    formStatus.style.backgroundColor = 'var(--bg)';
    formStatus.style.color = 'var(--text-main)';
    formStatus.textContent = 'Sending your message...';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, service, message })
      });

      const data = await response.json();

      if (response.ok) {
        formStatus.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
        formStatus.style.color = '#10b981';
        formStatus.textContent = 'Message sent successfully! I will get back to you soon.';
        contactForm.reset();
      } else {
        formStatus.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
        formStatus.style.color = '#ef4444';
        formStatus.textContent = data.error || 'Failed to send message. Please ensure the backend is configured.';
      }
    } catch (error) {
      formStatus.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
      formStatus.style.color = '#ef4444';
      formStatus.textContent = 'Network error. Could not connect to the server.';
    } finally {
      submitBtn.textContent = 'Send Message';
      submitBtn.disabled = false;
    }
  });
}

// Mobile Menu Logic
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn && navLinks) {
  mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = mobileMenuBtn.querySelector('i');
    if(navLinks.classList.contains('active')) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-xmark');
    } else {
      icon.classList.remove('fa-xmark');
      icon.classList.add('fa-bars');
    }
  });
}
