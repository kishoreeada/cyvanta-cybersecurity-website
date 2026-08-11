document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (selector, scope=document) => scope.querySelector(selector);
  const $$ = (selector, scope=document) => Array.from(scope.querySelectorAll(selector));

  /* ---------- Navigation ---------- */
  const nav = $(".nav");
  const menu = $(".nav-links");
  const toggle = $(".menu-toggle");
  const close = $(".menu-close");

  const closeMenu = () => {
    menu?.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };

  toggle?.addEventListener("click", () => {
    menu?.classList.toggle("open");
    const open = menu?.classList.contains("open");
    toggle.setAttribute("aria-expanded", String(!!open));
    document.body.classList.toggle("menu-open", !!open);
  });

  close?.addEventListener("click", closeMenu);
  $$(".nav-links a").forEach(a => a.addEventListener("click", closeMenu));

  const setNav = () => nav?.classList.toggle("scrolled", window.scrollY > 18);
  setNav();
  window.addEventListener("scroll", setNav, {passive:true});

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
      closeMenu();
      $("#dashboardSidebar")?.classList.remove("open");
    }
  });

  /* ---------- Active public navigation ---------- */
  const currentPage = (location.pathname.split("/").pop() || "index.html").split("?")[0];
  $$(".nav-center a, .footer-links a").forEach(a => {
    const href=(a.getAttribute("href")||"").split("#")[0].split("?")[0];
    a.classList.toggle("active", href===currentPage);
  });

  /* ---------- AOS ---------- */
  if (window.AOS && !reduced) {
    AOS.init({
      duration: 850,
      easing: "ease-out-cubic",
      once: true,
      offset: 80,
      delay: 0,
      disable: false
    });
  }

  /* ---------- Visual utility ---------- */
  const progress=document.createElement("div");
  progress.className="scroll-progress";
  document.body.appendChild(progress);

  const glow=document.createElement("div");
  glow.className="cursor-glow";
  document.body.appendChild(glow);

  if (window.innerWidth >= 768 && !reduced) {
    window.addEventListener("pointermove", e => {
      glow.style.left=e.clientX+"px";
      glow.style.top=e.clientY+"px";
      glow.style.opacity=".9";
    }, {passive:true});
    document.addEventListener("mouseleave",()=>glow.style.opacity="0");
  }

  /* ---------- GSAP motion system ---------- */
  if (window.gsap && !reduced) {
    const plugins=[];
    if (window.ScrollTrigger) plugins.push(window.ScrollTrigger);
    if (window.Observer) plugins.push(window.Observer);
    if (window.Flip) plugins.push(window.Flip);
    if (plugins.length) gsap.registerPlugin(...plugins);

    // Header arrival
    gsap.from(".nav-inner", {
      y:-20, opacity:0, duration:.65, ease:"power3.out", delay:.08
    });

    // Hero / page hero
    gsap.from(".hero-copy .eyebrow, .page-hero .breadcrumb", {
      x:-18, opacity:0, duration:.55, ease:"power3.out", delay:.12
    });
    gsap.from(".hero h1, .page-hero h1", {
      y:38, opacity:0, duration:.9, ease:"power4.out", delay:.18
    });
    gsap.from(".hero-copy p, .page-hero p", {
      y:22, opacity:0, duration:.7, ease:"power3.out", delay:.32
    });
    gsap.from(".hero-actions", {
      y:18, opacity:0, duration:.6, ease:"power3.out", delay:.44
    });

    // Hero visual parallax
    if (window.ScrollTrigger) {
      gsap.to(".hero-visual", {
        y:-55, ease:"none",
        scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:1}
      });
      gsap.to(".hero-real-image", {
        y:28, rotate:2, ease:"none",
        scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:1.4}
      });
      gsap.to(".page-hero .grid-bg", {
        y:70, ease:"none",
        scrollTrigger:{trigger:".page-hero",start:"top top",end:"bottom top",scrub:1}
      });
    }

    // Continuous cybersecurity atmosphere
    gsap.to(".orbit", {
      rotation:360, duration:28, repeat:-1, ease:"none"
    });
    gsap.to(".floating-panel", {
      y:-10, duration:2.4, repeat:-1, yoyo:true, stagger:.25, ease:"sine.inOut"
    });
    gsap.to(".hero-real-image", {
      scale:1.045, duration:3.2, repeat:-1, yoyo:true, ease:"sine.inOut"
    });

    // Scroll reveals for cards
    if (window.ScrollTrigger) {
      gsap.utils.toArray(".service-card,.industry-card,.process-step,.blog-card,.info-card,.contact-item,.dash-card,.photo-panel,.form").forEach((el,i)=>{
        gsap.fromTo(el,
          {opacity:0, y:30},
          {opacity:1,y:0,duration:.72,delay:(i%3)*.045,ease:"power3.out",
           scrollTrigger:{trigger:el,start:"top 88%",once:true}}
        );
      });

      // Section headings get a directional reveal
      gsap.utils.toArray(".section-head,.feature-copy,.auth-intro").forEach(el=>{
        gsap.fromTo(el,{opacity:0,x:-24},{opacity:1,x:0,duration:.75,ease:"power3.out",
          scrollTrigger:{trigger:el,start:"top 86%",once:true}});
      });

      // Animated section lines
      gsap.utils.toArray(".animated-line").forEach(line=>{
        gsap.fromTo(line,{scaleX:.05},{scaleX:1,duration:1.1,ease:"power3.out",
          scrollTrigger:{trigger:line,start:"top 90%",once:true}});
      });

      // Scroll progress
      gsap.to(progress,{
        scaleX:1,ease:"none",
        scrollTrigger:{start:0,end:"max",scrub:.15}
      });
    }

    // Magnetic CTA buttons
    $$(".magnetic,.btn,.nav-cta").forEach(el=>{
      el.addEventListener("pointermove", e=>{
        const r=el.getBoundingClientRect();
        const x=(e.clientX-(r.left+r.width/2))*.12;
        const y=(e.clientY-(r.top+r.height/2))*.12;
        gsap.to(el,{x,y,duration:.25,ease:"power2.out"});
      });
      el.addEventListener("pointerleave",()=>gsap.to(el,{x:0,y:0,duration:.3,ease:"power3.out"}));
    });

    // Card tilt / depth
    $$(".service-card,.blog-card,.dash-card").forEach(card=>{
      card.addEventListener("pointermove",e=>{
        if(window.innerWidth<768)return;
        const r=card.getBoundingClientRect();
        const rx=((e.clientY-r.top)/r.height-.5)*-4;
        const ry=((e.clientX-r.left)/r.width-.5)*4;
        gsap.to(card,{rotateX:rx,rotateY:ry,transformPerspective:900,duration:.25,ease:"power2.out"});
      });
      card.addEventListener("pointerleave",()=>gsap.to(card,{rotateX:0,rotateY:0,duration:.35,ease:"power3.out"}));
    });

    // Logo micro interaction
    $$(".logo-mark").forEach(el=>{
      el.addEventListener("mouseenter",()=>gsap.to(el,{rotation:10,scale:1.08,duration:.25}));
      el.addEventListener("mouseleave",()=>gsap.to(el,{rotation:0,scale:1,duration:.25}));
    });

    // Counter animation
    $$(".stat-number").forEach(el=>{
      const raw=el.textContent.replace(/[^0-9.]/g,"");
      const end=parseFloat(raw);
      if(!Number.isFinite(end))return;
      const suffix=el.querySelector("span")?.outerHTML||"";
      const obj={value:0};
      if(window.ScrollTrigger){
        gsap.to(obj,{
          value:end,duration:1.4,ease:"power2.out",
          scrollTrigger:{trigger:el,start:"top 88%",once:true},
          onUpdate:()=>{el.innerHTML=Math.round(obj.value)+suffix;}
        });
      }
    });
  }

  /* ---------- Contact form ---------- */
  const contactForm=$("#contactForm"), contactMsg=$(".form-message");
  contactForm?.addEventListener("submit",e=>{
    e.preventDefault();
    if(!contactForm.checkValidity()){contactForm.reportValidity();return;}
    if(contactMsg)contactMsg.textContent="Request received. Our security team will contact you shortly.";
    contactForm.reset();
  });

  /* ---------- Password visibility ---------- */
  $$(".password-toggle").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const input=btn.parentElement?.querySelector("input");
      if(!input)return;
      input.type=input.type==="password"?"text":"password";
      btn.setAttribute("aria-pressed",input.type==="text"?"true":"false");
    });
  });

  const showError=(field,msg)=>{
    const box=field?.closest(".field")?.querySelector(".field-error");
    if(box)box.textContent=msg||"";
  };

  /* ---------- Login ---------- */
  const login=$("#loginForm");
  login?.addEventListener("submit",e=>{
    e.preventDefault();
    const role=$("#loginRole",login), email=$("#loginEmail",login), pass=$("#loginPassword",login), msg=$(".auth-message",login);
    let ok=true;
    if(!role?.value){showError(role,"Select Admin or Client.");ok=false}else showError(role,"");
    if(!email?.checkValidity()){showError(email,"Enter a valid email address.");ok=false}else showError(email,"");
    if(!pass?.value || pass.value.length<8){showError(pass,"Password must be at least 8 characters.");ok=false}else showError(pass,"");
    if(!ok)return;

    const selectedRole=role.value;
    const normalizedEmail=email.value.trim();
    try{
      sessionStorage.setItem("cyvantaEmail",normalizedEmail);
      sessionStorage.setItem("cyvantaRole",selectedRole);
      sessionStorage.setItem("cyvantaAuthenticated","true");
      localStorage.setItem("cyvantaEmail",normalizedEmail);
      localStorage.setItem("cyvantaRole",selectedRole);
      localStorage.setItem("cyvantaAuthenticated","true");
    }catch(e){}

    if(msg)msg.textContent="Access verified. Opening secure portal…";
    const destination=selectedRole==="admin"?"admin/dashboard-overview.html":"client/dashboard-overview.html";
    const params=new URLSearchParams({role:selectedRole,email:normalizedEmail});
    setTimeout(()=>window.location.href=destination+"?"+params.toString(),250);
  });

  /* ---------- Signup ---------- */
  const signup=$("#signupForm"), pw=$("#signupPassword");
  const rule=(n,v)=>document.querySelector(`[data-rule="${n}"]`)?.classList.toggle("valid",v);
  pw?.addEventListener("input",()=>{
    const v=pw.value;
    rule("length",v.length>=8); rule("upper",/[A-Z]/.test(v)); rule("number",/[0-9]/.test(v)); rule("special",/[^A-Za-z0-9]/.test(v));
  });
  signup?.addEventListener("submit",e=>{
    e.preventDefault();
    const name=$("#signupName",signup), email=$("#signupEmail",signup), confirm=$("#signupConfirm",signup), terms=$("#terms",signup), msg=$(".auth-message",signup);
    let ok=true;
    if(!name?.value || !/^[A-Za-z .'-]{2,}$/.test(name.value)){showError(name,"Use a valid name.");ok=false}else showError(name,"");
    if(!email?.checkValidity()){showError(email,"Enter a valid email.");ok=false}else showError(email,"");
    if(!pw?.value || !/^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/.test(pw.value)){showError(pw,"Use 8+ characters with uppercase, number and special character.");ok=false}else showError(pw,"");
    if(!confirm?.value || confirm.value!==pw.value){showError(confirm,"Passwords do not match.");ok=false}else showError(confirm,"");
    if(!terms?.checked){if(msg)msg.textContent="Please accept the security policy.";ok=false;}
    if(!ok)return;
    if(msg)msg.textContent="Account validated. Continue to Login to choose your role.";
    setTimeout(()=>location.href="login.html",700);
  });

  /* ---------- Dashboard ---------- */
  const sidebar=$("#dashboardSidebar");
  $("#dashboardHamburger")?.addEventListener("click",()=>sidebar?.classList.add("open"));
  $(".dashboard-close")?.addEventListener("click",()=>sidebar?.classList.remove("open"));
  sidebar?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>sidebar.classList.remove("open")));

  const shell=$(".dashboard-shell");
  if(shell){
    const params=new URLSearchParams(location.search);
    let role=(params.get("role")||"").toLowerCase();
    let email=params.get("email")||"";
    if(!role)try{role=(sessionStorage.getItem("cyvantaRole")||localStorage.getItem("cyvantaRole")||"").toLowerCase();}catch(e){}
    if(!email)try{email=sessionStorage.getItem("cyvantaEmail")||localStorage.getItem("cyvantaEmail")||"";}catch(e){}

    const expected=document.body.classList.contains("dashboard-admin")?"admin":"client";
    if(!role||!email||role!==expected){
      location.replace("../login.html");
      return;
    }

    $$(".dashboard-menu a").forEach(link=>{
      const href=(link.getAttribute("href")||"").split("?")[0];
      if(href && !link.getAttribute("href").includes("?")){
        link.setAttribute("href",href+"?role="+encodeURIComponent(role)+"&email="+encodeURIComponent(email));
      }
      link.classList.toggle("active",href===location.pathname.split("/").pop());
    });

    const emailEl=$("#userEmail"), avatar=$("#userAvatar"), roleLabel=$("#dashboardRoleLabel");
    if(emailEl)emailEl.textContent=email;
    if(avatar)avatar.textContent=email.charAt(0).toUpperCase();
    if(roleLabel)roleLabel.textContent=role==="admin"?"Admin account":"Client account";

    const sectionEmail=$("#sectionEmail"), sectionAvatar=$("#sectionAvatar");
    if(sectionEmail)sectionEmail.textContent=email;
    if(sectionAvatar)sectionAvatar.textContent=email.charAt(0).toUpperCase();

    $("#logoutBtn")?.addEventListener("click",()=>{
      try{
        sessionStorage.clear();
        localStorage.removeItem("cyvantaEmail");
        localStorage.removeItem("cyvantaRole");
        localStorage.removeItem("cyvantaAuthenticated");
      }catch(e){}
      location.replace("../index.html");
    });
  }

  /* ---------- Requested CTA behavior ---------- */
  $$(".hero-actions .btn,.cta .btn,.dash-card .btn").forEach(btn=>{
    btn.addEventListener("click",e=>{
      e.preventDefault();
      location.href=shell?"../404.html":"404.html";
    });
  });
});
