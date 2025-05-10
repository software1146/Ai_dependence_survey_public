document.addEventListener("DOMContentLoaded", async () => {
  const scores = JSON.parse(localStorage.getItem("surveyScores"));

  if (!scores) {
    document.body.innerHTML = "<p>점수 데이터를 불러올 수 없습니다.</p>";
    return;
  }

  const maxScorePerType = {
    일반: 14 * 5,
    인식: 12 * 5,
    성향: 9 * 5,
    의존도: 17 * 5
  };

  const percentageScores = {
    인식: ((scores["인식"] / maxScorePerType["인식"]) * 100).toFixed(1),
    성향: ((scores["성향"] / maxScorePerType["성향"]) * 100).toFixed(1),
    의존도: ((scores["의존도"] / maxScorePerType["의존도"]) * 100).toFixed(1)
  };

  const resultDiv = document.getElementById("result");

  function getInterpretation(type, percent) {
    const p = parseFloat(percent);
    if (type === "인식") {
      if (p >= 80) return "디지털 인식 수준이 매우 높습니다. 훌륭해요!";
      if (p >= 50) return "평균적인 인식 수준입니다. 꾸준한 정보 업데이트가 필요해요.";
      return "디지털 리터러시 강화를 위한 교육이 필요합니다.";
    } else if (type === "성향") {
      if (p >= 80) return "건전한 디지털 성향을 가지고 있습니다.";
      if (p >= 50) return "다소 중립적이며, 위험 인식 강화가 필요할 수 있어요.";
      return "디지털 공간에서의 태도 개선이 필요해 보여요.";
    } else if (type === "의존도") {
      if (p >= 80) return "디지털 의존도가 매우 높습니다. 조절이 필요해요.";
      if (p >= 50) return "보통 수준의 의존도입니다. 사용 시간을 관리하면 좋아요.";
      return "디지털 기기에 대한 의존이 적절합니다.";
    }
    return "";
  }

  let averageScores = null;
  try {
    const response = await fetch("/averageResults");
    if (response.ok) {
      averageScores = await response.json();
    } else {
      console.error("평균 점수 불러오기 실패");
    }
  } catch (error) {
    console.error("서버 연결 오류:", error);
  }

  resultDiv.innerHTML = `
    <canvas id="radarChart"></canvas>
    <div class="score-details">
      ${["인식", "성향", "의존도"].map(type => `
        <div class="score-card">
          <h3>${type}</h3>
          <p><strong>원점수:</strong> ${scores[type]} / ${maxScorePerType[type]}</p>
          <p><strong>백분율:</strong> ${percentageScores[type]}%</p>
          <p class="interpretation">${getInterpretation(type, percentageScores[type])}</p>
        </div>
      `).join("")}
    </div>
  `;

  const ctx = document.getElementById("radarChart").getContext("2d");

  const radarData = {
    labels: ["인식", "성향", "의존도"],
    datasets: [
      {
        label: "나의 점수 (백분율)",
        data: [
          percentageScores["인식"],
          percentageScores["성향"],
          percentageScores["의존도"]
        ],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        pointBackgroundColor: "rgba(75, 192, 192, 1)"
      }
    ]
  };

  if (averageScores) {
    radarData.datasets.push({
      label: "전체 평균",
      data: [
        averageScores.Perception,
        averageScores.Tendency,
        averageScores.Dependence
      ],
      backgroundColor: "rgba(255, 99, 132, 0.2)",
      borderColor: "rgba(255, 99, 132, 1)",
      pointBackgroundColor: "rgba(255, 99, 132, 1)"
    });
  }

  new Chart(ctx, {
    type: "radar",
    data: radarData,
    options: {
      scales: {
        r: {
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: {
            stepSize: 20
          }
        }
      }
    }
  });

  await fetch("/addResults", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Perception: percentageScores["인식"],
      Tendency: percentageScores["성향"],
      Dependence: percentageScores["의존도"],
      Age: scores["나이"],
      Gender: scores["성별"]
    })
  });
});
