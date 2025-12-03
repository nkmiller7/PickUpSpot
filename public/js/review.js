(function () {
    const checkString = (strVal, varName) => {
        if (!strVal) throw `Error: You must supply a ${varName}!`;
        if (typeof strVal !== "string") throw `Error: ${varName} must be a string!`;
        strVal = strVal.trim();
        if (strVal.length === 0)
        throw `Error: ${varName} cannot be an empty string or string with just spaces`;
        return strVal;
    }
    const isLetter = (c)  =>{
        return (
            (c.charCodeAt(0) >= 65 && c.charCodeAt(0) <= 90) ||
            (c.charCodeAt(0) >= 97 && c.charCodeAt(0) <= 122)
        );
    }
    const checkNumber = (numVal, varName) =>{
        if (numVal === undefined || numVal === null)
            throw `Error: You must supply a ${varName}.`;
        if (typeof numVal === "string") {
            numVal = Number(numVal);
        }
        if (isNaN(numVal)) throw `Error: ${varName} must be a number.`;
        if (numVal < 0) throw `Error: ${varName} cannot be negative.`;
        return numVal;
    }
    const commentForm = document.getElementById("review-form");
    const errorDiv= document.getElementById("review-client-errors");
    let errors = [];
    if(commentForm){
        commentForm.addEventListener('submit', (event) => {
            errors=[]
            const comment = document.getElementById("review-comment");
            const rating = document.getElementById("rating")
            errorDiv.innerHTML="";
            errorDiv.style.display= "none";
            try{
                rating.value = checkNumber(rating.value, 'Rating');
                if (rating.value < 1 || rating.value > 5) throw 'Error: Rating must be between 1 and 5';
                if (rating.value.toString().includes(".") && rating.value.toString().split(".")[1].length > 1){
                    throw "Error: At most one decimal place is allowed for Ratings";
                }
            }catch(e){
                errors.push(e);
            }
            try{
                comment.value = checkString(comment.value, 'Comment');
                if (comment.value.length < 5 || comment.value.length > 250) throw 'Error: Comment must be between 5 and 250 characters, inclusive';
                let exists_letters= false;
                for(let c of comment.value){
                    if(isLetter(c)){
                        exists_letters=true;
                        break;
                    }
                }
                if(exists_letters===false){
                    throw 'Error: Review comment must contain letters'
                }
            }catch(e){
                errors.push(e);
            }
            if(errors.length>0){
                event.preventDefault();
                errorDiv.style.display="";
                errorDiv.innerHTML="<ul>";
                for(let e of errors){
                    errorDiv.innerHTML+=`<li>${e}</li>`;
                }
                errorDiv.innerHTML+="</ul>";
            }
        });
    }
})();