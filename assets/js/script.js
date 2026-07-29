'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });

// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const filterBtns = document.querySelectorAll("[data-filter-btn]");
const filterItems = document.querySelectorAll("[data-filter-item]");


// Fonction de filtrage
const filterFunc = (selectedValue) => {
  console.log(selectedValue);
  
  filterItems.forEach((item) => {
    const category = item.dataset.category;

    if (selectedValue === "all" || category === selectedValue) {
      item.classList.add("active");
      
    } else {
      item.classList.remove("active");
    }
  });
};

if (select) {
  select.addEventListener("click", () => elementToggleFunc(select));

  selectItems.forEach((item) => {
    item.addEventListener("click", () => {
      const selectedValue = item.getAttribute("data-select-item");
      elementToggleFunc(select);
      filterFunc(selectedValue);
      selectItems.forEach((selectItem) =>
        selectItem.classList.remove("active")
      );
      item.classList.add("active");
    });
  });
}

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const selectedValue = btn.getAttribute("data-filter-btn");
    filterFunc(selectedValue);
    filterBtns.forEach((filterBtn) =>
      filterBtn.classList.remove("active")
    );
    btn.classList.add("active");
  });
});


// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}



function envoieMail() {
   const emailInput = document.getElementById("email");
   const emailValue = emailInput.value;
   alert( emailValue);

  //TODO rajouter la methode d'appel a la librairie EmailJsa avec en paramètre emailValue
}



// wiki variables
const wikiBrowser = document.querySelector("[data-wiki-browser]");

if (wikiBrowser) {

  const wikiBreadcrumbEl = document.querySelector("[data-wiki-breadcrumb]");
  const wikiList = document.querySelector("[data-wiki-list]");
  const wikiReader = document.querySelector("[data-wiki-reader]");
  const wikiBackBtn = document.querySelector("[data-wiki-back]");
  const wikiReaderBreadcrumb = document.querySelector("[data-wiki-reader-breadcrumb]");
  const wikiReaderTitle = document.querySelector("[data-wiki-reader-title]");
  const wikiContent = document.querySelector("[data-wiki-content]");

  const wikiBasePath = "./pages/wiki/";
  let wikiFiles = [];
  let wikiCurrentDir = ""; // "" = racine du vault

  // segments de fileDir restant sous dir, ou null si fileDir n'est pas dans dir
  const wikiRelativeSegments = (dir, fileDir) => {
    if (dir === "") return fileDir === "" ? [] : fileDir.split("/");
    if (fileDir === dir) return [];
    if (fileDir.startsWith(dir + "/")) return fileDir.slice(dir.length + 1).split("/");
    return null;
  };

  const wikiChildFolders = (dir) => {
    const names = new Set();
    wikiFiles.forEach((f) => {
      const rel = wikiRelativeSegments(dir, f.dir);
      if (rel && rel.length > 0) names.add(rel[0]);
    });
    return [...names].sort((a, b) => a.localeCompare(b));
  };

  const wikiFilesInDir = (dir) =>
    wikiFiles
      .filter((f) => f.dir === dir)
      .sort((a, b) => a.title.localeCompare(b.title));

  const wikiOpenFile = (file) => {
    wikiReaderTitle.textContent = file.title;
    wikiReaderBreadcrumb.textContent = file.dir ? file.dir.split("/").join(" / ") : "Racine";
    wikiContent.innerHTML = "<p>Chargement…</p>";

    const notePath = wikiBasePath + file.path.split("/").map(encodeURIComponent).join("/");

    fetch(notePath)
      .then((res) => {
        if (!res.ok) throw new Error("note introuvable");
        return res.text();
      })
      .then((markdown) => {
        wikiContent.innerHTML = marked.parse(markdown);

        // wrap tables so wide Obsidian tables scroll horizontally on mobile instead of overflowing
        wikiContent.querySelectorAll("table").forEach((table) => {
          const wrapper = document.createElement("div");
          wrapper.className = "wiki-table-wrapper";
          table.parentNode.insertBefore(wrapper, table);
          wrapper.appendChild(table);
        });
      })
      .catch(() => {
        wikiContent.innerHTML = "<p>Impossible de charger cette note.</p>";
      });

    wikiBrowser.hidden = true;
    wikiReader.hidden = false;
    window.scrollTo(0, 0);
  };

  wikiBackBtn.addEventListener("click", () => {
    wikiReader.hidden = true;
    wikiBrowser.hidden = false;
  });

  const wikiGoTo = (dir) => {
    wikiCurrentDir = dir;
    wikiRender();
  };

  const wikiRenderBreadcrumb = () => {
    wikiBreadcrumbEl.innerHTML = "";
    const segments = wikiCurrentDir === "" ? [] : wikiCurrentDir.split("/");

    const addCrumb = (label, dir) => {
      const li = document.createElement("li");
      li.className = "wiki-breadcrumb-item";
      const btn = document.createElement("button");
      btn.textContent = label;
      btn.addEventListener("click", () => wikiGoTo(dir));
      li.appendChild(btn);
      wikiBreadcrumbEl.appendChild(li);
    };

    addCrumb("Wiki", "");

    let acc = "";
    segments.forEach((seg) => {
      acc = acc === "" ? seg : acc + "/" + seg;
      addCrumb(seg, acc);
    });

    wikiBreadcrumbEl.lastElementChild.classList.add("active");
  };

  const wikiRender = () => {
    wikiRenderBreadcrumb();

    const folders = wikiChildFolders(wikiCurrentDir);
    const filesHere = wikiFilesInDir(wikiCurrentDir);

    wikiList.innerHTML = "";

    if (folders.length === 0 && filesHere.length === 0) {
      wikiList.innerHTML = '<li class="wiki-status">Ce dossier ne contient aucune note.</li>';
      return;
    }

    folders.forEach((name) => {
      const li = document.createElement("li");
      li.className = "wiki-item active";

      const card = document.createElement("button");
      card.className = "wiki-card wiki-card-folder";
      card.innerHTML =
        '<div class="wiki-card-icon"><ion-icon name="folder-outline"></ion-icon></div>' +
        '<h3 class="wiki-card-title"></h3>';
      card.querySelector(".wiki-card-title").textContent = name;
      card.addEventListener("click", () => wikiGoTo(wikiCurrentDir === "" ? name : wikiCurrentDir + "/" + name));

      li.appendChild(card);
      wikiList.appendChild(li);
    });

    filesHere.forEach((file) => {
      const li = document.createElement("li");
      li.className = "wiki-item active";

      const card = document.createElement("button");
      card.className = "wiki-card";
      card.innerHTML =
        '<div class="wiki-card-icon"><ion-icon name="document-text-outline"></ion-icon></div>' +
        '<h3 class="wiki-card-title"></h3>';
      card.querySelector(".wiki-card-title").textContent = file.title;
      card.addEventListener("click", () => wikiOpenFile(file));

      li.appendChild(card);
      wikiList.appendChild(li);
    });
  };

  fetch("./pages/wiki-manifest.json")
    .then((res) => res.json())
    .then((data) => {
      wikiFiles = data.files || [];

      if (wikiFiles.length === 0) {
        wikiRenderBreadcrumb();
        wikiList.innerHTML = '<li class="wiki-status">Aucune note disponible pour le moment.</li>';
        return;
      }

      wikiRender();
    })
    .catch(() => {
      wikiRenderBreadcrumb();
      wikiList.innerHTML = '<li class="wiki-status">Impossible de charger le wiki.</li>';
    });

}