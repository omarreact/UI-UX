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



// Shared, accessible page interactions — no third-party frontend runtime.
const conceptFilterButtons = Array.from(document.querySelectorAll("[data-filter]"));
const conceptCards = Array.from(document.querySelectorAll(".showcase-card[data-category]"));
const conceptCount = document.querySelector("[data-results-count]");
if (conceptFilterButtons.length && conceptCards.length) {
    const applyConceptFilter = selected => {
        let visible = 0;
        conceptCards.forEach(card => {
            card.hidden = selected !== "all" && card.dataset.category !== selected;
            if (!card.hidden) visible++;
        });
        conceptFilterButtons.forEach(button => {
            const active = button.dataset.filter === selected;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
        });
        if (conceptCount) conceptCount.textContent = visible + " concept" + (visible === 1 ? "" : "s");
    };
    conceptFilterButtons.forEach(button => button.addEventListener("click", () => applyConceptFilter(button.dataset.filter)));
    applyConceptFilter("all");
}

const articleSearch = document.querySelector("[data-article-search]");
if (articleSearch) {
    const cards = Array.from(document.querySelectorAll(".article-card[data-search-text]"));
    const counter = document.querySelector("[data-article-count]");
    const empty = document.querySelector("[data-article-empty]");
    const runSearch = () => {
        const query = articleSearch.value.trim().toLocaleLowerCase();
        let visible = 0;
        cards.forEach(card => {
            card.hidden = !card.dataset.searchText.includes(query);
            if (!card.hidden) visible++;
        });
        if (counter) counter.textContent = query ? visible + " matching article" + (visible === 1 ? "" : "s") : "Showing all " + cards.length + " articles";
        if (empty) empty.hidden = visible !== 0;
    };
    articleSearch.addEventListener("input", runSearch);
    runSearch();
}

// This showcase deliberately uses the visitor's email client; no undisclosed backend.
const projectForm = document.querySelector("#project-form");
if (projectForm) {
    const feedback = document.querySelector("#form-feedback");
    const serviceSelect = projectForm.elements.namedItem("service");
    const preselected = new URLSearchParams(window.location.search).get("service");
    if (preselected && serviceSelect) {
        const available = Array.from(serviceSelect.options).some(option => option.value === preselected);
        if (available) serviceSelect.value = preselected;
    }
    const compose = () => {
        if (!projectForm.reportValidity()) return null;
        const data = new FormData(projectForm);
        const clean = value => String(value || "").trim();
        return [
            "Project inquiry — Softly Solutions design showcase",
            "",
            "Name: " + clean(data.get("name")),
            "Email: " + clean(data.get("email")),
            "Service: " + clean(data.get("service")),
            "Stage: " + clean(data.get("stage")),
            "",
            "Project overview:",
            clean(data.get("message"))
        ].join("\n");
    };
    projectForm.addEventListener("submit", event => {
        event.preventDefault();
        const message = compose();
        if (!message) {
            if (feedback) feedback.textContent = "Please complete the required fields before preparing your inquiry.";
            return;
        }
        const subject = "Website design inquiry — Softly Solutions showcase";
        if (feedback) feedback.textContent = "Your email application will open with the message prepared. Review it and press Send there to deliver it.";
        window.location.href = "mailto:admin@pincodeit.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(message);
    });
    const copyButton = document.querySelector("[data-copy-inquiry]");
    if (copyButton) copyButton.addEventListener("click", async () => {
        const message = compose();
        if (!message) {
            if (feedback) feedback.textContent = "Complete the required fields before copying your inquiry.";
            return;
        }
        if (feedback) feedback.textContent = "Preparing a copy of your inquiry…";
        try {
            if (!navigator.clipboard || !navigator.clipboard.writeText) throw Error("Clipboard unavailable");
            await navigator.clipboard.writeText(message);
            if (feedback) feedback.textContent = "Inquiry copied. Paste it into your preferred email or messaging app.";
        } catch {
            if (feedback) feedback.textContent = "Clipboard access is unavailable. Use Prepare inquiry to open your email application.";
        }
    });
}

const colorStatus = document.querySelector("[data-color-status]");
document.querySelectorAll("[data-copy-color]").forEach(button => {
    button.addEventListener("click", async () => {
        if (colorStatus) colorStatus.textContent = "Selected color: " + button.dataset.copyColor;
        try {
            if (!navigator.clipboard || !navigator.clipboard.writeText) throw Error("Clipboard unavailable");
            await navigator.clipboard.writeText(button.dataset.copyColor);
            if (colorStatus) colorStatus.textContent = button.dataset.copyColor + " copied to clipboard.";
        } catch {
            if (colorStatus) colorStatus.textContent = "Color code: " + button.dataset.copyColor + ". Copy it manually if clipboard permission is unavailable.";
        }
    });
});
