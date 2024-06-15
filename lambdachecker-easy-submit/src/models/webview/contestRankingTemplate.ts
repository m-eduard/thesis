import * as vscode from "vscode";
import {
  Contest,
  MaxSubmissionMeta,
  ProblemMetadataContestContext,
  ProblemTotalGrade,
  RankListEntry,
  User,
} from "../api";

const getProblemsHeaderHTML = (
  problems: ProblemMetadataContestContext[],
  problemsGrades: ProblemTotalGrade[]
) => {
  console.log("Printing problems", problems);
  problems.forEach((problem) => {
    console.log(problem.name);
  });

  return problems
    .map(
      (problem) =>
        `<th><div class="header-cell-wrapper" onclick="showProblem(${
          problem.id
        })">
            <span class="top-layer-countdown">${problem.name}</span>
            <span class="bottom-layer-countdown">${
              problemsGrades.filter((x) => x.id === problem.id)[0]?.total || 0
            } points</span>
          </div>
        </th>`
    )
    .join("");
};

const formatDeltaT = (contestStart: string, submissionDate: string) => {
  const distance =
    new Date(submissionDate).getTime() - new Date(contestStart).getTime();

  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor((distance % (1000 * 60)) / 1000)
    .toString()
    .padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

const getRankingTableEntryHTML = (
  rankListEntry: RankListEntry,
  rank: number,
  problems: ProblemMetadataContestContext[],
  contestStart: string,
  problemsGrades: ProblemTotalGrade[]
) => {
  const orderedMaxSubmissions: (MaxSubmissionMeta | undefined)[] = [];
  const orderedProblemsGrades: (ProblemTotalGrade | undefined)[] = [];

  // Use the same ordering for contest problems,
  // max submissions and problems grades
  for (let i = 0; i < problems.length; i++) {
    orderedMaxSubmissions.push(
      rankListEntry.max_submissions.filter(
        (x) => x.problem_id === problems[i].id
      )[0]
    );

    orderedProblemsGrades.push(
      problemsGrades.filter((x) => x.id === problems[i].id)[0]
    );
  }

  let maxSubmissionsData = "";
  for (let i = 0; i < problems.length; ++i) {
    if (orderedMaxSubmissions[i] === undefined) {
      maxSubmissionsData += `<td></td>`;

      continue;
    }

    maxSubmissionsData += `
<td>
  <div class="grade-cell-wrapper">
    <span class="${
      orderedProblemsGrades[i]!.total === orderedMaxSubmissions[i]!.grade
        ? "accepted"
        : "failed"
    }">${orderedMaxSubmissions[i]!.grade || "0"}</span>
    <span class="bottom-layer-countdown">${formatDeltaT(
      contestStart,
      orderedMaxSubmissions[i]!.date
    )}</span>
    <span class="bottom-layer-countdown" ${
      orderedMaxSubmissions[i]!.all_subs_count <= 1
        ? `style="visibility: hidden;"`
        : ""
    }>(-${orderedMaxSubmissions[i]!.all_subs_count - 1})</span>
  </div>
</td>`;
  }

  return `
  <tr>
    <td>${rank}</td>
    <td>${rankListEntry.username}</td>
    <td>${rankListEntry.points}</td>
    ${maxSubmissionsData}
  </tr>
  `;
};

export const getContestRankingHTML = (
  stylesUri: vscode.Uri,
  scriptsUri: vscode.Uri,
  contestMetadata: Contest,
  problemsGrades: ProblemTotalGrade[],
  users: User[],
  oldRankingData: RankListEntry[],
  offsetRank: number
) => {
  const rankingData = oldRankingData
    .map((entry, idx) =>
      getRankingTableEntryHTML(
        entry,
        offsetRank + idx + 1,
        contestMetadata.problems,
        contestMetadata.start_date,
        problemsGrades
      )
    )
    .join("");

  console.log(rankingData);

  return `
<!DOCTYPE html>
<html lang="en">
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ranking ${contestMetadata.name}</title>
    <link rel='stylesheet' type='text/css' href='${stylesUri}'>
  </head>
    <body>
    <h1>Ranking ${contestMetadata.name}</h1>

    <table class="ranking-table">
        <thead>
            <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Score</th>
                ${getProblemsHeaderHTML(
                  contestMetadata.problems,
                  problemsGrades
                )}
            </tr>
        </thead>
        <tbody>
            ${rankingData}
        </tbody>
      </table>

      <script src="${scriptsUri}"></script>
    </body>
  </html>
  `;
};
