const mobileToggle = document.querySelector('.mobile-toggle');
        const mobileLinks = document.querySelector('#primary-navigation');
        if (mobileToggle && mobileLinks) {
            const closeMenu = () => {
                mobileLinks.classList.remove('is-open');
                mobileToggle.setAttribute('aria-expanded', 'false');
                mobileToggle.setAttribute('aria-label', 'Open navigation menu');
            };
            mobileToggle.addEventListener('click', () => {
                const isOpen = mobileLinks.classList.toggle('is-open');
                mobileToggle.setAttribute('aria-expanded', String(isOpen));
                mobileToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
            });
            mobileLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
            document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
            document.addEventListener('click', event => { if (!mobileToggle.contains(event.target) && !mobileLinks.contains(event.target)) closeMenu(); });
            window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });
        }

        // Functional insights without a framework or third-party dependency.
        const insightArticles = [{"topic":"MARKETING","title":"The Hidden Cost of Generic Marketing","body":["When every brand uses the same claims, stock phrases and visual patterns, customers have little reason to choose one over another. Distinctiveness starts with a specific audience, a clear promise and proof that the promise matters.","Audit the language on your homepage: could a competitor use the exact same sentence? Replace vague superlatives with the customer problem you solve and the result people can expect.","Make your strongest message obvious above the fold, support it with meaningful work examples, and build each campaign around one measurable action."]},{"topic":"DIGITAL EXPERIENCE","title":"Why Your Application Matters More Than Ads","body":["Advertising can bring someone to your product. What they experience next determines whether that attention becomes trust, action or frustration. Speed, clarity, accessibility and the quality of small interactions all shape that decision.","Start with your top three user journeys. Remove unnecessary steps, use understandable labels and make next actions visible on both small and large screens.","Measure successful task completion—not just traffic—and keep refining the areas where people hesitate or abandon their journey."]},{"topic":"DESIGN","title":"A Playbook for Brand-Led Digital Growth","body":["A strong digital identity does more than look recognizable. It makes the company easier to understand, easier to navigate and more memorable after the first visit.","Define a small set of repeatable rules for typography, color, spacing, imagery and motion. Apply them consistently to landing pages, product surfaces and communication.","Review your design alongside real user behavior: the best brand system reinforces the path to action without getting in the way."]}];
        const insightDialog = document.querySelector('#insight-dialog');
        if (insightDialog && typeof insightDialog.showModal === 'function') {
            const closeInsight = () => insightDialog.close();
            document.querySelectorAll('.insight-open').forEach(button => {
                button.addEventListener('click', () => {
                    const item = insightArticles[Number(button.dataset.insight)];
                    if (!item) return;
                    document.querySelector('#insight-dialog-category').textContent = item.topic;
                    document.querySelector('#insight-dialog-title').textContent = item.title;
                    const body = document.querySelector('#insight-dialog-body');
                    body.replaceChildren();
                    item.body.forEach(paragraph => {
                        const p = document.createElement('p');
                        p.textContent = paragraph;
                        body.append(p);
                    });
                    insightDialog.showModal();
                    insightDialog.querySelector('.insight-close').focus();
                });
            });
            insightDialog.querySelector('.insight-close').addEventListener('click', closeInsight);
            insightDialog.querySelector('.insight-done').addEventListener('click', closeInsight);
            insightDialog.addEventListener('click', event => {
                if (event.target === insightDialog) closeInsight();
            });
        }
        // A small progress cue and return-to-top affordance for the long landing page.
        const progress = document.querySelector('.scroll-progress');
        const backToTop = document.querySelector('.back-to-top');
        let scrollFrame = false;
        const updateScrollUI = () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (progress) progress.style.width = (maxScroll > 0 ? Math.min(100, window.scrollY / maxScroll * 100) : 0) + '%';
            if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY > 800);
            scrollFrame = false;
        };
        window.addEventListener('scroll', () => {
            if (!scrollFrame) { scrollFrame = true; window.requestAnimationFrame(updateScrollUI); }
        }, {passive: true});
        window.addEventListener('resize', updateScrollUI);
        updateScrollUI();

        // FAQ: connect buttons and answer regions for screen readers; avoid clipped answers.
        const faqButtons = Array.from(document.querySelectorAll('.acc-btn'));
        const setFaqOpen = (btn, open) => {
            const item = btn.closest('.acc-item');
            const panel = item.querySelector('.acc-content');
            item.classList.toggle('active', open);
            btn.setAttribute('aria-expanded', String(open));
            panel.setAttribute('aria-hidden', String(!open));
            panel.style.maxHeight = open ? panel.scrollHeight + 'px' : '0px';
        };
        faqButtons.forEach((btn, index) => {
            const panel = btn.closest('.acc-item').querySelector('.acc-content');
            const panelId = 'faq-answer-' + (index + 1);
            const btnId = 'faq-question-' + (index + 1);
            panel.id = panelId;
            btn.id = btnId;
            btn.setAttribute('aria-controls', panelId);
            panel.setAttribute('role', 'region');
            panel.setAttribute('aria-labelledby', btnId);
            setFaqOpen(btn, btn.closest('.acc-item').classList.contains('active'));
            btn.addEventListener('click', () => {
                const willOpen = !btn.closest('.acc-item').classList.contains('active');
                faqButtons.forEach(other => setFaqOpen(other, other === btn && willOpen));
            });
        });
        window.addEventListener('resize', () => {
            faqButtons.forEach(btn => {
                if (btn.closest('.acc-item').classList.contains('active')) {
                    btn.closest('.acc-item').querySelector('.acc-content').style.maxHeight =
                        btn.closest('.acc-item').querySelector('.acc-content').scrollHeight + 'px';
                }
            });
        });
        // Keep navigation highlighting connected to the section being viewed.
        if ('IntersectionObserver' in window) {
            const sectionAnchors = Array.from(document.querySelectorAll('#primary-navigation a[href^="#"]'));
            const sectionById = sectionAnchors.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    const link = sectionAnchors.find(a => a.getAttribute('href') === '#' + entry.target.id);
                    if (link && entry.isIntersecting) {
                        sectionAnchors.forEach(a => a.removeAttribute('aria-current'));
                        link.setAttribute('aria-current', 'location');
                    }
                });
            }, {rootMargin: '-18% 0px -65% 0px', threshold: 0});
            sectionById.forEach(section => observer.observe(section));
        }
