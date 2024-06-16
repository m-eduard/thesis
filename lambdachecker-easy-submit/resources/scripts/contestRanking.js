const vscode = acquireVsCodeApi();

let ranking = {};
let users = [];
let currentPage = 1;
let currentSlidingWindow = [1, 10];

function showProblem(problemId) {
  console.log("Received the message here");

  vscode.postMessage({
    action: 'show-problem',
    problemId: problemId,
  });
}

window.addEventListener("message", event => {
  const message = event.data;

  switch (message.action) {
    case 'initializeUsers':
      users = users.length ? users : message.users;
      break;
    case 'updateUsers':
      users = message.users;
      break;
    case 'getRankingPageRespose':
      ranking[message.page] = message.ranking;

      const rankingTableBody = Element.getElementById("ranking-data");
      rankingTableBody.replaceChildren();
  }
});



function updateRankingPage(targetPage) {
  console.log("Updating ranking page", totalPages, targetPage);

  if (targetPage === "-1") {
    targetPage = Math.max(currentPage - 1, 1);
  } else if (targetPage === "+1") {
    targetPage = Math.min(currentPage + 1, totalPages);
  }

  if (targetPage === currentSlidingWindow[0] && targetPage !== 1) {
    console.log("begin");
    document.getElementById(`page-${currentSlidingWindow[0] - 1}-btn`).style.display = "flex";
    document.getElementById(`page-${currentSlidingWindow[1]}-btn`).style.display = "none";
    currentSlidingWindow[0]--;
    currentSlidingWindow[1]--;

    if (currentSlidingWindow[1] - currentSlidingWindow[0] > 9) {
      console.log("shrinking ... ");

      document.getElementById(`page-${totalPages - 2}-btn`).style.display = "none";
      document.getElementById(`page-${totalPages - 1}-btn`).style.display = "none";
      document.getElementById(`page-${totalPages}-btn`).style.display = "none";
      document.getElementById('points').style.display = "flex";
      document.getElementById('dummy-btn').style.display = "flex";

      currentSlidingWindow[1] = currentSlidingWindow[0] + 9;
    }
  } else if (targetPage === currentSlidingWindow[1] && targetPage !== totalPages) {
    console.log("end");
    document.getElementById(`page-${currentSlidingWindow[1] + 1}-btn`).style.display = "flex";
    document.getElementById(`page-${currentSlidingWindow[0]}-btn`).style.display = "none";
    currentSlidingWindow[0]++;
    currentSlidingWindow[1]++;
  }

  if (totalPages - targetPage <= 3) {
    document.getElementById(`page-${totalPages - 1}-btn`).style.display = "flex";
    document.getElementById(`page-${totalPages}-btn`).style.display = "flex";
    document.getElementById('points').style.display = "none";
    document.getElementById('dummy-btn').style.display = "none";

    currentSlidingWindow[1] = totalPages;
  }

  document.getElementById(`page-${currentPage}-btn`).classList.remove("pagination-button-active");
  currentPage = targetPage;
  document.getElementById(`page-${currentPage}-btn`).classList.add("pagination-button-active");

  if (ranking[currentPage]) {
    displayRanking(ranking[currentPage]);
  } else {
    vscode.postMessage({
      action: 'get-ranking-page',
      page: currentPage,
    });
  }
}
