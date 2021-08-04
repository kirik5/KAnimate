import Animate from "./_animate";

const content01 = document.querySelector('.firstScreen__content01')
const content02 = document.querySelector('.firstScreen__content02')
const animate = new Animate()

const btnShowHide01 = document.querySelector('.showHide01')
btnShowHide01.addEventListener('click', (evt) => {

    if (btnShowHide01.innerHTML === "Show") {
        animate.show(content01, {
            name: 'fade',
            // afterEnter: () => {
                
            // }
        });
        btnShowHide01.innerHTML = "Hide"
        
    } else if (btnShowHide01.innerHTML === "Hide") {
        animate.hide(content01, {
            name: 'fade',
            // afterLeave: () => {
                
            // }
        });
        btnShowHide01.innerHTML = "Show"
    }
})

const btnShowHide02 = document.querySelector('.showHide02')
btnShowHide02.addEventListener('click', (evt) => {

    if (btnShowHide02.innerHTML === "Show") {
        animate.show(content02, {
            name: 'fade',
            // afterEnter: () => {
                
            // }
        });
        btnShowHide02.innerHTML = "Hide"
        
    } else if (btnShowHide02.innerHTML === "Hide") {
        animate.hide(content02, {
            name: 'fade',
            // afterLeave: () => {
                
            // }
        });
        btnShowHide02.innerHTML = "Show"
    }
})

// const btnShow = document.querySelector('.show')
// btnShow.addEventListener('click', () => {
//     animate.show(content, {
//         name: 'fade'
//     })
// })

// const btnHide = document.querySelector('.hide')
// btnHide.addEventListener('click', () => {
//     animate.hide(content, {
//         name: 'fade'
//     })
// })