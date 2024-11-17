async function getDid(handle) {
  const response = await fetch(
    `https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`
  );
  if (!response.ok) throw new Error("Could not resolve handle");
  const data = await response.json();
  return data.did;
}

async function fetchLikes(handle) {
  try {
    const did = await getDid(handle);
    console.log("Got DID:", did);

    const response = await fetch(
      `https://bsky.social/xrpc/com.atproto.repo.listRecords?repo=${did}&collection=app.bsky.feed.like`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok)
      throw new Error(`Server responded with ${response.status}`);

    const data = await response.json();
    console.log("Likes data:", data);
    showLikesPopup(data.records);
  } catch (error) {
    console.error("Full error:", error);
    alert("Error fetching likes: " + error.message);
  }
}

function showLikesPopup(likes) {
  const popup = document.createElement("div");
  popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
      max-height: 80vh;
      overflow-y: auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
      z-index: 10000;
      color: black;
    `;

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close";
  closeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 5px 10px;
      background: #ff4444;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;
  closeBtn.onclick = () => popup.remove();
  popup.appendChild(closeBtn);

  const content = document.createElement("div");

  if (likes && likes.length > 0) {
    likes.forEach((like) => {
      const post = document.createElement("div");
      post.style.cssText =
        "margin: 10px 0; padding: 10px; border-bottom: 1px solid #eee;";
      post.innerHTML = `
          <div style="font-weight: bold">Post URI:</div>
          <div style="word-break: break-all">${like.value.subject.uri}</div>
          <div style="margin-top: 10px">Liked at: ${new Date(
            like.value.createdAt
          ).toLocaleString()}</div>
        `;
      content.appendChild(post);
    });
  } else {
    content.textContent = "No likes found";
  }

  popup.appendChild(content);
  document.body.appendChild(popup);
}

function addLikesButton() {
  const existingButton = document.querySelector("#bsky-likes-btn");
  if (existingButton) return;

  const button = document.createElement("button");
  button.id = "bsky-likes-btn";
  button.textContent = "Show Likes";
  button.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 9999;
      padding: 8px 16px;
      background: #0066ff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;

  button.onclick = () => {
    const handle = window.location.pathname.split("/")[2];
    if (handle) fetchLikes(handle);
  };

  document.body.appendChild(button);
}

addLikesButton();

let lastPath = window.location.pathname;
setInterval(() => {
  if (window.location.pathname !== lastPath) {
    lastPath = window.location.pathname;
    if (lastPath.includes("/profile/")) {
      addLikesButton();
    }
  }
}, 1000);
