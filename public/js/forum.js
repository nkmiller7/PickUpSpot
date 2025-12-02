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
    const commentForm = document.getElementById("comment-form");
    const errorDiv= document.getElementById("forum-client-errors");
    if(commentForm){
        commentForm.addEventListener('submit', (event) => {
             try{
                const comment = document.getElementById("comment");
                const rating = document.getElementById("")
                errorDiv.innerHTML="";
                errorDiv.style.display= "none";
                comment.value = checkString(comment.value, "Comment");
                if (comment.value.trim().length < 5 || comment.value.trim().length > 500) throw 'Error: Message content must be between 5 and 500 characters, inclusive';
                let exists_letters= false;
                for(let c of comment.value){
                    if(isLetter(c)){
                        exists_letters=true;
                        break;
                    }
                }
                if(exists_letters===false){
                    throw 'Error: Comment content must contain letters'
                }
            }catch(e){
                event.preventDefault();
                errorDiv.style.display=""
                errorDiv.innerHTML=`<ul><li>${e}</li></ul>`
            }
        });
    }
})();