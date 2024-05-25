// exam details here
const examDetails = {
  "schoolName": "Jamna Vidyapeeth",
  "schoolLogo": "https://i.postimg.cc/Y0qB2Wyc/images-2024-05-21-T183208-408.jpg",
  "examName": "Periodic Test - I",
  "subject": "Computer",
  "grade": "VIII",
  "maxMarks": 20,
  "date": "2.05.24",
  "durationHrs": "1"
}

// function to populate table with selected questions
function fillQuestions(selectedQMap, questions, qContainers) {
  let outerQuestionCounter = 1;
  
  // fetch table element
  let table = document.getElementById("qTable");

  // array holding weightages of all containers
  const containerWeights = [];

  // variable to keep track of questions inserted in the container (to find shortfall later on)
  let quesInsertedInContainer;

  // loop through all headings of qContainers
  for(let i = 0; i < qContainers['headings'].length;  i++) {
    let containerHeading = qContainers['headings'][i];
    let weightageText = "";
    let innerQuestionCounter = 1;
    quesInsertedInContainer = 0;
    // Create a new table row
    let tr = document.createElement("tr");

    // if settings [border] is false, increase spacing before each new container for improved readability
    if(!qContainers['settings']['border']) {
        tr.classList.add("increased-spacing");
}

    // find total container weightage and total number of questions requested for this container
    let totalContainerWeightage = 0;
    let qNumInCaseOfOneQ = 0;
    let qWeightInCaseOfOneQ = 0;
    let qTypeInCaseOfOneQ;
    let quesRequiredForContainer = 0;
    
    
    for(const key in qContainers['qTypes'][i]) {
        const w = qContainers['qTypes'][i][key] * qContainers['weightPerQ'][i][key];
        totalContainerWeightage += w;
        quesRequiredForContainer += qContainers['qTypes'][i][key];
        if(w !== 0) {
             qNumInCaseOfOneQ = qContainers['qTypes'][i][key];
             qWeightInCaseOfOneQ = qContainers['weightPerQ'][i][key];
              qTypeInCaseOfOneQ = key;
        }

    }

    // check whether container has a mix of questions
    const areQuesMixed = ((Object.keys(qContainers['qTypes'][i]).filter(key => qContainers['qTypes'][i][key] !== 0).length) > 1); 

    // display total container weightage appropriately
    if(areQuesMixed) {
        weightageText = totalContainerWeightage + "M";
    }
    else if(qWeightInCaseOfOneQ) {
        totalContainerWeightage = (qNumInCaseOfOneQ * qWeightInCaseOfOneQ);
        weightageText = '[' + qNumInCaseOfOneQ + '×' + qWeightInCaseOfOneQ + '=' + totalContainerWeightage + 'M]';
    }

    // push current container weightage into containerWeights array for finding total (max marks) of paper later on
    containerWeights.push(totalContainerWeightage);
    

    // Create three table data cells and add them to the row
    let td1 = document.createElement("td");
    td1.textContent = "Q." + outerQuestionCounter;
    let td2 = document.createElement("td");
    td2.textContent = containerHeading || generateContainerHeading(areQuesMixed, qTypeInCaseOfOneQ);
    let td3 = document.createElement("td");
    td3.textContent = weightageText;

// make all table cells editable if editable is set to true
       if(qContainers['settings']['editable']) {
        td1.contentEditable = "true";
        td2.contentEditable = "true";
        td3.contentEditable = "true";
}

    // remove all borders from all cells, if settings[border] is false
      if(!qContainers['settings']['border']) {
          td1.classList.add('no-border');
          td2.classList.add('no-border');
          td3.classList.add('no-border');
     }

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);

    // Set font weight of the row to bold
    tr.style.fontWeight = "bold";

    // Append the tr to table
    table.appendChild(tr);

    // get required number of questions of specified types for this question container along with their respective weightage arrays
    const {questions: fetchedQ, weightages: weightageArr} = getQuestionsForContainer(qContainers['qTypes'][i], questions, selectedQMap, qContainers['weightPerQ'][i]);


    // creating Fill up Help Box
    // if the container contains only Fill up type questions and a help box is requested in settings, create a help box and prepend it to the container

    if(!areQuesMixed && qTypeInCaseOfOneQ == 'Fill up' && qContainers['settings']['showHelpBoxInFillUp']) {
        const helpBox = getFillUpHelpBox(fetchedQ);
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        const td2 = document.createElement('td');
        const td3 = document.createElement('td');
        td2.appendChild(helpBox);

// make all table cells editable if editable is set to true
       if(qContainers['settings']['editable']) {
        td1.contentEditable = "true";
        td2.contentEditable = "true";
        td3.contentEditable = "true";
}

       // remove all borders from all cells, if settings[border] is false
      if(!qContainers['settings']['border']) {
          td1.classList.add('no-border');
          td2.classList.add('no-border');
          td3.classList.add('no-border');
      }

       // remove top and bottom borders from all td
       td1.style.borderTop = 0;
       td2.style.borderTop = 0;
       td3.style.borderTop = 0;
       td1.style.borderBottom = 0;
       td2.style.borderBottom = 0;
       td3.style.borderBottom = 0;

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        table.appendChild(tr);
    }

       
    // loop through all fetched questions to be inserted in current question container
    for(let j = 0; j < fetchedQ.length; j++) {

      // Create a new table row
      let tr = document.createElement("tr");

      // Create three table data cells and add them to the row
      let td1 = document.createElement("td");
      td1.textContent = innerQuestionCounter + ".";
      let td2 = document.createElement("td");
      td2.appendChild(getQuestionNode(fetchedQ[j], areQuesMixed, qContainers['settings']));
      let td3 = document.createElement("td");
      td3.innerHTML = "(" + decimalToFraction(weightageArr[j]) + ")";

        // make all table cells editable if editable is set to true
       if(qContainers['settings']['editable']) {
        td1.contentEditable = "true";
        td2.contentEditable = "true";
        td3.contentEditable = "true";
}

      // remove all borders from all cells, if settings[border] is false
      if(!qContainers['settings']['border']) {
          td1.classList.add('no-border');
          td2.classList.add('no-border');
          td3.classList.add('no-border');
      }

      // remove top and bottom borders from all td
      td1.style.borderTop = 0;
      td2.style.borderTop = 0;
      td3.style.borderTop = 0;
      td1.style.borderBottom = 0;
      td2.style.borderBottom = 0;
      td3.style.borderBottom = 0;

      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);

      // Append the tr to table
      table.appendChild(tr);

      quesInsertedInContainer++;
      innerQuestionCounter++;
    }
    // end of questions loop

    // if fetched questions are less than required number, insert blank rows and ask user to enter remaining questions manually
    if(quesInsertedInContainer < quesRequiredForContainer) {
        const shortfall = quesRequiredForContainer - quesInsertedInContainer;
        let qNum = quesInsertedInContainer + 1;

        for(let s=0; s<shortfall; s++) {
            const tr = document.createElement('tr');
            const td1 = document.createElement('td');
            const td2 = document.createElement('td');
            const td3 = document.createElement('td');
            td1.textContent = qNum;
            td2.innerHTML = "Question Deficit: The question bank lacks enough suitable questions for your paper criteria. Please input a question manually or upgrade your question bank.";

            // make all table cells editable if editable is set to true
       if(qContainers['settings']['editable']) {
        td1.contentEditable = "true";
        td2.contentEditable = "true";
        td3.contentEditable = "true";
}

      // remove all borders from all cells, if settings[border] is false
      if(!qContainers['settings']['border']) {
          td1.classList.add('no-border');
          td2.classList.add('no-border');
          td3.classList.add('no-border');
      }

      // remove top and bottom borders from all td
      td1.style.borderTop = 0;
      td2.style.borderTop = 0;
      td3.style.borderTop = 0;
      td1.style.borderBottom = 0;
      td2.style.borderBottom = 0;
      td3.style.borderBottom = 0;

            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            table.appendChild(tr);
            qNum++;
        }
    }
    // end shortfall check condition

    outerQuestionCounter++;
  }
  // end of container loop
  

  // Get the cells in the last row and set their bottom border (only if settings[border] is set to true
if(qContainers['settings']['border']) {
        Array.from(table.rows[table.rows.length - 1].cells).forEach(cell => {
    cell.style.borderBottom = '1px solid black';
        });
}

// if settings[border] is false, remove the very first header table row as well
if(!qContainers['settings']['border']) {
    document.getElementById('header-row').style.display = 'none';
}

  // set Max Marks for entire paper
  document.getElementById('mm').textContent = "MM: " +  containerWeights.reduce((total, current) => total + current, 0) + "M";

  // minor layout adjustments
  adjustMCQOptionsWidth();
  
  // hide question weightages, max marks and duration if settings[hideWeightage] is true (follow a plain worksheet or answer key kind of format)
  if(qContainers['settings']['hideWeightage']) {
      table.classList.add('hide-weightage');
      document.getElementById('mm').style.display = "none";
      document.getElementById('duration').style.display = "none";
  }
  



  }
// end of function


// function to get the required number of questions for a question container (returns array of question strings with JSON Params attached)
function getQuestionsForContainer(obj, questions, selectedQMap, weightageObj) {
    const array = [];
    const weightages = [];
    for(const key in obj) {
        const qIndices = selectedQMap[key];
        const qRequired = obj[key];
        const selectedQIndices = extractAndRemove(qIndices, qRequired);
        for(const x of selectedQIndices) {
              array.push(questions[x]);
              weightages.push(weightageObj[key]);
        }
        // inner for loop ends
    }
    // outer for loop ends
    return {"questions": array, "weightages": weightages};
}


// function to extract and remove n elements from an array reference
function extractAndRemove(array, n) {
    const extracted = array.slice(0, n);
    array.splice(0, n);
    return extracted;
}

// function to fetch an HTML question node based on qType
function getQuestionNode(question, areQuesMixed, settings) {

    // create a parent container
    const parent = document.createElement('div');

    // extract relevant setting values
    const provideAnsOrSpace = settings['provideAnsOrSpace'];
    const spaceForAns = settings['spaceForAns'];
    const showAns = (settings['provideAnsOrSpace'] === 'ans')? true : false;
    const provideAnsSpace = (settings['provideAnsOrSpace'] === 'space')? true : false;
    const shuffleMCQOptions = settings['shuffleMCQOptions'];
    const useDotPatternInBlanks = settings['useDotPatternInBlanks'];
    const isPaperEditable = settings['editable'];

    // separate question text from JSON parameters
    let questionText = extractStringBeforeJSON(question);
    const questionParams = extractJSONFromString(question);

    // get media related params
    const mediaEmbedded = questionParams['mediaEmbedded'];
    const mediaLink = questionParams['mediaLink'];

    // get answer (for non-MCQ questions)
    const ansExplanation = questionParams['ansExplanation'];

    // determine question type
    const qType = questionParams['qType'];

    // append full stop in True/False and Fill up based questions
    if(qType == "Fill up" || qType == "True/False") {
    questionText = appendFullStop(questionText);
    // replace underscore pattern with dot pattern in Fill up blanks
        if(qType == "Fill up" && useDotPatternInBlanks) {
             questionText = replaceUnderscoresWithDots(questionText);
        }
    }

    // Regex pattern to identify MCQ-type questions (backward compatibility for questions without qType param)
    const mcqPattern = /\(Options: (.*) Correct: (.*)\)$/i;

    if(qType == 'MCQ' || mcqPattern.test(question)) {
        
        parent.appendChild( DOMHandleMCQ(questionText, mcqPattern, showAns, shuffleMCQOptions, mediaEmbedded, mediaLink, isPaperEditable));
    }

    else if(qType == 'True/False') {
        parent.appendChild( DOMHandleTrueFalse(questionText, areQuesMixed, showAns, ansExplanation, provideAnsSpace, spaceForAns, qType, mediaEmbedded, mediaLink, isPaperEditable));
    } 

    else if(qType == 'Fill up' || qType == 'Very Short Answer Type' || qType == 'Short Answer Type' || qType == 'Long Answer Type' || qType == 'Very Long Answer Type') {
        parent.appendChild( DOMHandleSingleLineQ(questionText, showAns, ansExplanation, qType, provideAnsSpace, spaceForAns, mediaEmbedded, mediaLink, isPaperEditable));
    }

    else if (qType == 'Match items') {
         parent.appendChild(DOMHandleMatchItems(questionText, showAns, ansExplanation, qType, provideAnsSpace, spaceForAns, mediaEmbedded, mediaLink, isPaperEditable));
    }


    return parent;
    
}
    

// function to handle MCQs and create appropriate HTML node for presentation 

function DOMHandleMCQ(question, mcqPattern, showAns, shuffleMCQOptions, mediaEmbedded, mediaLink, isPaperEditable) {

    // separate question part, options & correct answer using regex pattern
    const [, optionsPart, correctAnswer] = mcqPattern.exec(question);
    let options = optionsPart.split(/Option [A-D]}\s*/).filter(Boolean).map(option => option.trim());

    // if shuffleMCQOptions is true, shuffle the options 
    if(shuffleMCQOptions) {
        options = shuffleArray(options);
    }

    question = question.replace(mcqPattern, '').trim();

    // create a parent node
    const parent = document.createElement('div');
    parent.style.display = "block";

    // create a question div
    const qHolder = document.createElement('div');
    qHolder.innerHTML = question;
    qHolder.style.paddingBottom = "0.12cm";

    // create a flex container for holding options
    const flexContainer = document.createElement('div');
    flexContainer.style.width = "100%";
    flexContainer.style.display = "flex";

     // append question div to the parent div
    parent.appendChild(qHolder);

    // embed image (if any) with the question
    if(mediaEmbedded === 'image' && mediaLink) {
        const img = getImageNode(mediaLink, isPaperEditable);
        qHolder.appendChild(img);
    }


    // Calculate the combined length of all option strings
    const totalOptionLength = options.reduce((acc, option) => acc + option.length, 0);

    // determine class name to be set depending on combined length of options
    if(totalOptionLength > 59) {
        flexContainer.classList.add('option-flex-container-stacked');
    } else {
        flexContainer.classList.add('option-flex-container');
    }
    
  
    // create children (option containers)
    for(let j = 0; j < options.length; j++) {
        const child = document.createElement('div');
        child.classList.add('option-flex-item');
        // if showAns is true, and this child container holds the correct answer, add class tick-mark-choice; 
        if(showAns && options[j] === correctAnswer) {
            child.classList.add('tick-mark-choice'); 
            child.style.position = "relative";
        }
        child.textContent = String.fromCharCode(97+j) + ") " + options[j];
        child.style.flexGrow = 1;
        flexContainer.appendChild(child);
    }
    
    // then, append options container
    parent.appendChild(flexContainer)
    return parent;


}


// function to adjust the width of options in MCQ type questions so as to align them with each other

function adjustMCQOptionsWidth() {
    // Select all flex containers
    const flexContainers = document.querySelectorAll('.option-flex-container');

    // Initialize an array to store maximum widths for each position
    const maxWidths = {};

    // Loop through each flex container
    flexContainers.forEach(container => {
        // Select all flex items in the current container
        const flexItems = container.querySelectorAll('.option-flex-item');

        // Loop through each flex item in the current container
        flexItems.forEach((item, index) => {
            // Ensure there is an entry for this position in maxWidths array
            if (!maxWidths[index]) {
                maxWidths[index] = 0;
            }

            // Get the width of the current flex item
            const width = item.offsetWidth;

            // Update maximum width if necessary
            if (width > maxWidths[index]) {
                maxWidths[index] = width;
            }
        });
    });

    // Loop through each flex container again to set widths
    flexContainers.forEach(container => {
        // Select all flex items in the current container
        const flexItems = container.querySelectorAll('.option-flex-item');

        // Loop through each flex item in the current container
        flexItems.forEach((item, index) => {
            // Set the width of the current flex item to the maximum width for its position
            item.style.width = maxWidths[index] + 'px';
        });
    });
}


// function to handle True/False Questions
function DOMHandleTrueFalse(question, areQuesMixed, showAns, answer, provideAnsSpace, spaceForAns, qType, mediaEmbedded, mediaLink, isPaperEditable) {

    // create a grandparent element
    const grandparent = document.createElement('div');
    grandparent.style.width = "100%";

    // create a parent flex container
    const parent = document.createElement('div');
    parent.style.display = "flex";
    parent.style.width = "100%";

    // create two child nodes
    const flexItem1 = document.createElement("div");
    flexItem1.style.flex = "0 0 82%";
    const flexItem2 = document.createElement("div");
    flexItem2.style.flex = "0 0 18%";
    flexItem2.style.textAlign = "right";
    flexItem2.style.paddingRight = "0.03cm";

    // add question in the first child node, and True/False text in the second
    flexItem1.innerHTML = question;
    flexItem2.textContent = "(True/False)";

    // append the child nodes to parent node
    parent.appendChild(flexItem1);

    // if the container in which this question is to be added contains a mix of different question types, append the text "Is it true or false?" to the question itself, otherwise append a True/False tickbox to the right side. If showAns is true, also show answer appropriately
    if(areQuesMixed) {
        flexItem1.innerHTML += " Is it true or false?";
        flexItem1.style.width = "100%";
        flexItem1.style.flexGrow = "1";
        if(provideAnsSpace) {
            flexItem1.innerHTML += " &nbsp;<strong>Ans: </strong>.............";
        }
        else if(showAns) {
            flexItem1.innerHTML += "<br><strong>Answer:</strong> " + getTrueFalseVal(answer);
        } 
    } else {
        parent.appendChild(flexItem2);
        if(showAns) {
            flexItem2.style.position = "relative";
            parent.style.paddingBottom = "0.2cm";
            if(answer.toLowerCase() === "t" || answer.toLowerCase() === "true") {
                flexItem2.classList.add('tick-true');
            } else {
                flexItem2.classList.add('tick-false');
            }
        }
    }

    grandparent.appendChild(parent);

    // embed image (if any) with the question
    if(mediaEmbedded === 'image' && mediaLink) {
        const img = getImageNode(mediaLink, isPaperEditable);
        grandparent.appendChild(img);
    }
   
    return grandparent;

}

// function to handle plain one line questions
function DOMHandleSingleLineQ(question, showAns, answer, qType, provideAnsSpace, spaceForAns, mediaEmbedded, mediaLink, isPaperEditable) {

    // create a parent node
    const parent = document.createElement('div');
    parent.style.width = "100%";

    // create a question node
    const qHolder = document.createElement('div');
    qHolder.innerHTML = question;

    // create an answer node
    const ansHolder = document.createElement('div');

    // append to parent
    parent.appendChild(qHolder);

    // embed image (if any) with the question
    if(mediaEmbedded === 'image' && mediaLink) {
        const img = getImageNode(mediaLink, isPaperEditable);
        qHolder.appendChild(img);
    }

    // show answer if requested
    if(showAns) {
       ansHolder.innerHTML = "<strong>Answer: </strong>" + ((qType == "Fill up" || qType == "Very Short Answer Type")? "" : "<br>") + answer;
        parent.appendChild(ansHolder);
    }
    // provide space for answer if requested
    else if(provideAnsSpace) {
        parent.appendChild(getAnsSpaceNode(qType, spaceForAns));
    }
    return parent;
}

// function to handle Match items based questions
function DOMHandleMatchItems(question, showAns, answer, qType, provideAnsSpace, spaceForAns, mediaEmbedded, mediaLink, isPaperEditable) {

    const parent = document.createElement('div');
    parent.style.width = "100%";
    


}

// function to append full stop
function appendFullStop(str) {
    if (!str.endsWith('.')) {
        return str + '.';
    }
    return str;
}

// function to convert decimals to fractions
function decimalToFraction(decimal) {
    const tolerance = 1.0E-6;
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = decimal;
    
    if (Number.isInteger(decimal)) {
        // If the decimal is a plain integer, return it as it is
        return `${decimal}`;
    }
    
    let fractionStr = "";
    const wholePart = Math.floor(decimal);
    const fractionalPart = decimal - wholePart;
    if (wholePart !== 0) {
        fractionStr = `${wholePart}`;
    }
    
    if (fractionalPart === 0.5) {
        fractionStr += "&#189;";
    } else if (fractionalPart === 0.25) {
        fractionStr += "&#188;";
    } else if (fractionalPart === 0.75) {
        fractionStr += "&#190;";
    } else {
        do {
            const a = Math.floor(b);
            [h1, h2] = [a * h1 + h2, h1];
            [k1, k2] = [a * k1 + k2, k1];
            b = 1 / (b - a);
        } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);
        
        let numerator = h1, denominator = k1;
        if (numerator !== 1) {
            fractionStr += ` ${numerator}`;
        }
        fractionStr += `&#8260;${denominator}`;
    }
    
    return fractionStr;
}

// function to shuffle array using Fisher-Yates method
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}


// function to create answer space node (in case space for answers is to be given along with questions)
function getAnsSpaceNode(qType, spaceForAns) {
    const linesNeeded = spaceForAns[qType];
    const parent = document.createElement('div');
    parent.style.width = "97%";

    if(qType != "Fill up") {
        // minor adjustment to push the very first line a bit down and prepend "Ans: "
        parent.style.paddingTop = "0.2cm";
        parent.innerHTML = "<strong>Ans: </strong>";
    }
    for(let j = 0; j < linesNeeded; j++) {
        const child = document.createElement('div');
        child.style.width = "100%";
        child.style.height = "0.6cm";
        child.style.borderTop = "1px dotted black";
        parent.appendChild(child);
        // reduce the height of last line
        if(j == linesNeeded - 1) {
            child.style.height = "0.12cm";
        }
    }
    return parent;
}

// function to replace underscores pattern with .... in fill ups
function replaceUnderscoresWithDots(str) {
  return str.replace(/_{3,50}/g, function(match) {
    return '...'.repeat(match.length);
  });
}

// function to convert t/T/f/F to True/False
function getTrueFalseVal(val) {
    if(val.toLowerCase() == 't' || val.toLowerCase() == 'true') {
        return "True";
    } else if(val.toLowerCase() == 'f' || val.toLowerCase() == 'false') {
        return "False";
    } else { return val;}
}


// function to generate an image node for questions
function getImageNode(src, isPaperEditable) {
        const img = document.createElement('img');
        img.setAttribute("src", src);
        img.style.display = "block";
        img.style.width = "40%";
        img.style.margin = "0.3cm 0";
        // enable dragging, replacement and resizing of image if paper is editable
        if(isPaperEditable) {
            img.classList.add('draggable');
            makeDraggable(img);
            resizeImageOnDoubleClickAndDoubleTap(img);
            changeImageSrcOnLongPress(img);
        }

        return img;
}

// function to create a help box in case of Fill ups when requested
function getFillUpHelpBox(q) {
  // create a container
  const box = document.createElement('div');
  box.style.padding = "0.3cm";
  box.style.margin = "0.2cm auto";
  box.style.width = "70%";
  box.style.border = "1px solid black";
  box.style.borderRadius = "5px";
  box.style.textAlign = "center";
  // extract answers, shuffle them to create hint box
  const JSONObjs = q.map(item => extractJSONFromString(item));
  let hints = JSONObjs.map(item => item.ansExplanation);
  hints = shuffleArray(hints);
  box.innerHTML = hints.join(', ');
  return box;
}

// function to generate container heading (if not supplied)
function generateContainerHeading(areQuesMixed, qType) {
  if(areQuesMixed) {
    return "Answer the following questions:";
  } 
  else {
    switch(qType) {
      case "MCQ": 
        return "Tick the correct option:";
      case "Fill up": 
        return "Fill in the blanks with the correct answers:";
      case "True/False": 
        return "State whether the following statements are True or False:";
      case "Match items": 
        return "Match the following items correctly:";
      case "Very Short Answer Type": 
        return "Answer the following very short answer type questions:";
      case "Short Answer Type": 
        return "Answer the following short answer type questions:";
      case "Long Answer Type": 
        return "Answer the following long answer type questions:";
      case "Very Long Answer Type": 
        return "Answer the following very long answer type questions:";
       default:
         return "Answer the following questions:";
    }
    // end switch
  }
  // end else
}


// function to handle draggable elements
function makeDraggable(element) {
  let isDragging = false;
  let startX, startY;

  // Initialize Hammer.js on the element
  const hammer = new Hammer(element);

  // Listen for panstart, panmove, and panend events
  hammer.on('panstart', onPanStart);
  hammer.on('panmove', onPanMove);
  hammer.on('panend', onPanEnd);

  function onPanStart(e) {
    isDragging = true;
    startX = e.center.x - element.getBoundingClientRect().left;
    startY = e.center.y - element.getBoundingClientRect().top;
  }

  function onPanMove(e) {
    if (isDragging) {
      const newX = e.center.x - startX;
      const newY = e.center.y - startY;
      element.style.left = `${newX}px`;
      element.style.top = `${newY}px`;
    }
  }

  function onPanEnd() {
    isDragging = false;
  }
}

// function to enable resizing of images upon double click
function resizeImageOnDoubleClickAndDoubleTap(imageNode) {
  const sizes = [20, 35, 50, 75, 100]; // Array of percentage sizes
  let currentIndex = 0; // Start with the first size

  imageNode.style.width = sizes[currentIndex] + '%'; // Set initial size

  // Function to cycle through sizes
  function cycleSize() {
    currentIndex = (currentIndex + 1) % sizes.length;
    imageNode.style.width = sizes[currentIndex] + '%';
  }

  // Initialize Hammer.js on the image node
  const hammer = new Hammer(imageNode);

  // Listen for double tap events and call cycleSize
  hammer.on('doubletap', cycleSize);
}

// function to allow user to change the src of an image in a question by long clicking or tapping
function changeImageSrcOnLongPress(imageNode) {
  let delayTimer;

  // Initialize Hammer.js on the image node
  const hammer = new Hammer(imageNode);

  // Listen for press event
  hammer.on('press', onPress);

  function onPress() {
    delayTimer = setTimeout(() => {
      const newSrc = prompt("Enter the new source link for the image:");
      if (newSrc) {
        imageNode.src = newSrc;
      }
    }, 1000);
  }

  // Cancel long press action if press is released before 1 second
  imageNode.addEventListener('pointerup', () => {
    clearTimeout(delayTimer);
  });
}
