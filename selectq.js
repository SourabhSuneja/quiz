// global variables & constants
let chapterNames;
let chapterStartPoints;

// mapping card values with difficulty levels
const difficultyLevels = { "easy": [10, 25], "medium": [50, 75], "hard": [100] };

// question paper map
const questionPaperMap = {
    "gk": {
        "MCQ": 10,
        "Very Short Answer Type": 10,
        "Short Answer Type": 10,
        "Long Answer Type": 10,
        "True/False": 10,
        "Fill up": 10,
        "audio": false,
        "image": false,
        "video": false
    },
    "ch-2": {
        "MCQ": 0,
        "Short Answer Type": 0,
        "Long Answer Type": 0,
        "audio": false,
        "image": false,
        "video": false
    }
};

// question container headings along with number of questions to be included from each qType (MCQ, Fill up etc) with their respective weightages
const qContainers = {
    headings: [
                "", 
                "",
                "",
                ""
    ],
    qTypes: [
                 {
                      "MCQ": 4,
                      "Fill up": 1,
                      "True/False": 0
                 },
                 {
                      "True/False": 4,                
                 },
                 {
                      "Short Answer Type": 3,                
                 },
                 {
                      "Fill up": 5,                
                 },
    ],
    weightPerQ: [
                 {
                      "MCQ": 1,
                      "Fill up": 1,
                      "True/False": 1
                      
                 },
                 {
                      "True/False": 1,             
                 },
                 {
                      "Short Answer Type": 2,             
                 },
                 {
                      "Fill up": 1,             
                 },
    ],
    settings: {
          randomiseSelection: false,
          editable: false,
          hideWeightage: false,
          border: false,
          shuffleMCQOptions: true,
          provideAnsOrSpace: "none",
          useDotPatternInBlanks: true,
          showHelpBoxInFillUp: true,
          spaceForAns: {
              "True/False": 1,
              "Very Short Answer Type": 1,
              "Short Answer Type": 2,
              "Long Answer Type": 4
          },
    qTypesAllowedInImageQ: [     
             "MCQ",
             "Short Answer Type",
             "Fill up",
             "True/False"
          ]
    }
};


// overall difficulty level of question paper
const overallDifficulty = "easy";
        
// Function to fetch data from a file using AJAX and return a promise

  function fetchData(fileName) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            const data = xhr.responseText.split('\n').map(item => item.trim()).filter(item => item !== '');
            resolve(data);
          } else {
            reject(new Error("Failed to load data"));
          }
        }
      };
      xhr.open("GET", fileName, true);
      xhr.send();
    });
  }

// function to take one or more filenames and return a consolidated array of data fetched from each file using fetchData function

async function fetchMultipleFilesData(fileNames) {
  const files = fileNames.split('+');
  chapterNames = files;
  const consolidatedData = [];
  chapterStartPoints = [];
  for (const fileName of files) {
    try {
      const data = await fetchData(fileName.endsWith('.txt') ? fileName : fileName + '.txt');
      chapterStartPoints.push(consolidatedData.length);
      consolidatedData.push(...data);
    } catch (error) {
      console.error(`Error fetching data from ${fileName}:`, error);
    }
  }
  
  return consolidatedData;
}

// function to extract the JSON parameters from question string
function extractJSONFromString(inputString) {
    const jsonStartIndex = inputString.indexOf('JSONParams:');
    if (jsonStartIndex === -1) {
        return null; // JSON part not found in the string
    }

    const jsonString = inputString.substring(jsonStartIndex + 'JSONParams:'.length);
    const trimmedJsonString = jsonString.trim();
    const firstCurlyBraceIndex = trimmedJsonString.indexOf('{');
    const lastCurlyBraceIndex = trimmedJsonString.lastIndexOf('}');
    if (firstCurlyBraceIndex === -1 || lastCurlyBraceIndex === -1) {
        console.error('Error: Invalid JSON structure');
        return null;
    }

    const jsonSubstring = trimmedJsonString.substring(firstCurlyBraceIndex, lastCurlyBraceIndex + 1);
    try {
        const jsonObject = JSON.parse(jsonSubstring);
        return jsonObject;
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return null;
    }
}

// function to generate index maps on the basis of different JSON parameters attached with questions
function generateIndexMap(questions, basis) {
  // Step 1: Extract the JSON part from all questions
  const extractedObjects = questions.map(extractJSONFromString);
  
  // Step 2 & 3: Iterate over all JSON objects, extract key values on the basis of "basis" property and create object with unique basis values and their indices
  const indexMap = {};
  const uniqueBasisValues = [];
  extractedObjects.forEach((obj, index) => {
    if (obj && obj.hasOwnProperty(basis)) {
      const basisValue = obj[basis];
      if (!indexMap.hasOwnProperty(basisValue)) {
        uniqueBasisValues.push(basisValue);
        indexMap[basisValue] = [];
      }
      indexMap[basisValue].push(index);
    }
  });

  return {"map": indexMap, "uniqueValues": uniqueBasisValues};
}

// function to get index map of questions based on chapters
function getQuestionIndicesByChapter(questions, chapterStartPoints, chapterNames) {
    const chapters = {};

    for (let i = 0; i < chapterNames.length; i++) {
        const chapterName = chapterNames[i];
        const start = chapterStartPoints[i];
        const end = (i + 1 < chapterStartPoints.length) ? chapterStartPoints[i + 1] : questions.length;
        
        chapters[chapterName] = Array.from({ length: end - start }, (_, index) => start + index);
    }

    return chapters;
}

// function to get difficulty level based on card value
function getDifficultyLevel(cardValue) {
    for (const level in difficultyLevels) {
        const range = difficultyLevels[level];
        if (range.length === 1) {
            if (cardValue >= range[0]) {
                return level;
            }
        } else {
            if (cardValue >= range[0] && cardValue <= range[1]) {
                return level;
            }
        }
    }
    return null;
}

// function to get total count of each question type
function countEachQuestionType(questionPaperMap) {
  const totalQuestions = {};

  for (const chapter in questionPaperMap) {
    const chapterQuestions = questionPaperMap[chapter];

    for (const type in chapterQuestions) {
      const count = chapterQuestions[type];
      if (totalQuestions[type]) {
        totalQuestions[type] += count;
      } else {
        totalQuestions[type] = count;
      }
    }
  }

  return totalQuestions;
}

// function to find common elements in arrays
function findCommonElements(...arrays) {
    if (arrays.length === 0) {
        return [];
    }
    
    // Use the first array to initialize the Set of common elements
    let commonElements = new Set(arrays[0]);
    
    // Iterate through the remaining arrays
    for (let i = 1; i < arrays.length; i++) {
        // Use a Set to store unique elements of the current array
        let set = new Set(arrays[i]);
        
        // Filter the commonElements Set to keep only elements present in the current array
        commonElements = new Set([...commonElements].filter(element => set.has(element)));
    }
    
    // Convert the Set back to an array
    return [...commonElements];
}

// function to filter out items from array1 that exist in array2 until array1 has reached a specified minimum length
function filterArray(array1, array2, minLen) {

    if(array1.length === minLen) {
        return array1;
    }
    
    let filteredArray = [];
    let removedItems = [];
    
    for (let i = 0; i < array1.length; i++) {
        if (!array2.includes(array1[i])) {
            filteredArray.push(array1[i]);
        }
        else {
            removedItems.push(array1[i]);
        }
    }

    // if filtered array has become too short, fill back some of the removed items randomly (if randomisation is allowed otherwise pick first n items)
    if (minLen != undefined && filteredArray.length < minLen) {
        const diff = minLen - filteredArray.length;
        let items;
        if(qContainers['settings']['randomiseSelection']) { items = selectRandomItems(removedItems, diff);
        } else {
            items = removedItems.slice(0, diff);
        }
        filteredArray = [...filteredArray, ...items];
    }
    
    return filteredArray;
}

// function to randomly select 'n' number of items from an array
function selectRandomItems(arr, n) {
  // // if n is greater than the length of the array, return the array back simply after shuffling the existing items
  if (n > arr.length) {
    return shuffleArray(arr);
  }

  // Shuffle the array to randomize the order
  const shuffled = arr.sort(() => Math.random() - 0.5);

  // Return the first n elements from the shuffled array
  return shuffled.slice(0, n);
}


// function to pick items alternately from start and end of an array
function pickItemsAlternately(arr) {
    // Sort the array in ascending order
    arr.sort((a, b) => a - b);

    // Initialize an empty array to store the result
    let result = [];

    // Initialize pointers for the beginning and end of the array
    let start = 0;
    let end = arr.length - 1;

    // Loop until start pointer is less than or equal to end pointer
    while (start <= end) {
        // Add item from start pointer
        result.push(arr[start]);
        // Move start pointer to the next item
        start++;

        // Check if start pointer has not crossed end pointer
        if (start <= end) {
            // Add item from end pointer
            result.push(arr[end]);
            // Move end pointer to the previous item
            end--;
        }
    }

    // Return the result array
    return result;
}

// function to filter questions based on supplied overall difficulty level for question paper
function filterOnDifficultyLevel(q, overallDifficulty, numQuesReq, uniqueCardIndices, cardIndexMap) {

  // sort card values based on difficult level demanded
  if(overallDifficulty == "easy") {
    uniqueCardIndices.sort((a, b) => b - a);
  }
  else if(overallDifficulty == "hard") {
    uniqueCardIndices.sort((a, b) => a - b);
  }
  else if(overallDifficulty == "medium") {
    uniqueCardIndices = pickItemsAlternately(uniqueCardIndices);
  }
  
  // loop through all card indices and remove items progressively
  uniqueCardIndices.forEach(
    function(cardValue) {
      const thisCardMap = cardIndexMap[cardValue];
      q = filterArray(q, thisCardMap, numQuesReq);
    }
  );
return q;
}

// function to extract the question string before the JSONParams part
function extractStringBeforeJSON(inputString) {
    const jsonStartIndex = inputString.indexOf('JSONParams:');
    if (jsonStartIndex === -1) {
        return inputString; 
    }
    
    return inputString.substring(0, jsonStartIndex);
}


// function to start the question fetching and preparation process
async function start() {

  // fetch all questions from all files
  let questions = await fetchMultipleFilesData("gk");

  // get total count of each type of questions on the basis of question paper map
  let totalQOfEachType = countEachQuestionType(questionPaperMap)
  
  // generate index map on the basis of card values
  let { map: cardIndexMap, uniqueValues: uniqueCardIndices } = generateIndexMap(questions, "card");


   // generate index map on the basis of question type
  let { map: qTypeIndexMap, uniqueValues: uniqueQTypeIndices } = generateIndexMap(questions, "qType");

  // generate index map on the basis of media embedded in questions
  let { map: mediaEmbeddedIndexMap, uniqueValues: uniqueMediaEmbeddedIndices } = generateIndexMap(questions, "mediaEmbedded");

  // merging mediaEmbeddedIndexMap with qTypeIndexMap
  qTypeIndexMap['audio'] = mediaEmbeddedIndexMap['audio'];
  qTypeIndexMap['video'] = mediaEmbeddedIndexMap['video'];
  qTypeIndexMap['image'] = mediaEmbeddedIndexMap['image'];

  
  
  // generate index map on the basis of chapters
  let chapterIndexMap = getQuestionIndicesByChapter(questions, chapterStartPoints, chapterNames);

  // select questions
  const selectedQMap = selectQuestions(questions, chapterNames, chapterIndexMap, cardIndexMap, qTypeIndexMap, mediaEmbeddedIndexMap, totalQOfEachType, questionPaperMap, overallDifficulty, uniqueCardIndices, uniqueQTypeIndices,  qContainers['settings']['qTypesAllowedInImageQ']);

fillQuestions(selectedQMap, questions, qContainers);


}


// function to select questions based on supplied criteria
function selectQuestions(questions, chapterNames, chapterIndexMap, cardIndexMap, qTypeIndexMap, mediaEmbeddedIndexMap, totalQOfEachType, questionPaperMap, overallDifficulty, uniqueCardIndices, uniqueQTypeIndices,  allowedQTypesForImages) {

  // array holding selected questions
  let selected = {};


  // remove disallowed qTypes for image-based questions from the index maps
  uniqueQTypeIndices.forEach(
       function(item) {
            const allowed = allowedQTypesForImages.includes(item);
            if(!allowed) {

                qTypeIndexMap[item] = filterArray(qTypeIndexMap[item], qTypeIndexMap['image']);

            }
       }
  );


  // looping all chapters in question paper map
  for (let chapter in questionPaperMap) {
    if (questionPaperMap.hasOwnProperty(chapter)) {


      // get question indices for current chapter
      const chapterIndices = chapterIndexMap[chapter];

      // looping all question types in current chapter
      for (let type in questionPaperMap[chapter]) {
        if (questionPaperMap[chapter].hasOwnProperty(type)) {

          // get all indices of current question type
          const typeIndices = qTypeIndexMap[type];

          // no. of questions needed for this question type from current chapter
          const numQuesReq = questionPaperMap[chapter][type];

          // get questions common to current chapter and current type
          let q = findCommonElements(chapterIndices, typeIndices);

          // if q exceeds number of questions required for this type for this chapter, filter out some questions based on other criteria

          // remove video based if video type ques required = 0 
          if (questionPaperMap[chapter]['video'] == false) {
            q = filterArray(q, qTypeIndexMap['video']);
          }

          // remove audio based if audio type ques required = 0 
          if (questionPaperMap[chapter]['audio'] == false) {
            q = filterArray(q, qTypeIndexMap['audio']);
          }

          // remove image based if image type ques required = 0 
          if (questionPaperMap[chapter]['image'] == false) {
            q = filterArray(q, qTypeIndexMap['image']);
          }

          // filter questions on basis of card values (difficulty) if we still have excess of questions
          q = filterOnDifficultyLevel(q, overallDifficulty, numQuesReq, uniqueCardIndices, cardIndexMap);

          // if, after criteria-based filtering, there are still excess questions, randomly select the required number of questions (if randomiseSelection is set to true or else just select the first n elements)
          if(qContainers['settings']['randomiseSelection']) {
            q = selectRandomItems(q, numQuesReq);
          } else {
              q = q.slice(0, numQuesReq);
          }

          // finally, add the questions of this type to the selected questions object
          if (!selected.hasOwnProperty(type)) {
    selected[type] = [];
          }
          selected[type] = selected[type].concat(q);

        } // End of if (questionPaperMap[chapter].hasOwnProperty(type))
      } // End of for (let type in questionPaperMap[chapter])
    } // End of if (questionPaperMap.hasOwnProperty(chapter))
  } // End of for (let chapter in questionPaperMap)

return selected;
} // End of function selectQuestions



// call start function to begin the entire question fetching and selection process
window.onload = start;
