const supportedCards = {
  visa: "https://seeklogo.com/images/V/VISA-logo-16F4F82D13-seeklogo.com.png",
  mastercard: "https://seeklogo.com/images/M/MasterCard-logo-92AB7D0014-seeklogo.com.png"
};

  const countries = [
    {
      code: "US",
      currency: "USD",
      currencyName: '',
      country: 'United States'
    },
    {
      code: "NG",
      currency: "NGN",
      currencyName: '',
      country: 'Nigeria'
    },
    {
      code: 'KE',
      currency: 'KES',
      currencyName: '',
      country: 'Kenya'
    },
    {
      code: 'UG',
      currency: 'UGX',
      currencyName: '',
      country: 'Uganda'
    },
    {
      code: 'RW',
      currency: 'RWF',
      currencyName: '',
      country: 'Rwanda'
    },
    {
      code: 'TZ',
      currency: 'TZS',
      currencyName: '',
      country: 'Tanzania'
    },
    {
      code: 'ZA',
      currency: 'ZAR',
      currencyName: '',
      country: 'South Africa'
    },
    {
      code: 'CM',
      currency: 'XAF',
      currencyName: '',
      country: 'Cameroon'
    },
    {
      code: 'GH',
      currency: 'GHS',
      currencyName: '',
      country: 'Ghana'
    }
  ];

  const billHype = () => {
    const billDisplay = document.querySelector('.mdc-typography--headline4');
    if (!billDisplay) return;

    billDisplay.addEventListener('click', () => {
      const billSpan = document.querySelector("[data-bill]");
      if (billSpan &&
        appState.bill &&
        appState.billFormatted &&
        appState.billFormatted === billSpan.textContent) {
        window.speechSynthesis.speak(
          new SpeechSynthesisUtterance(appState.billFormatted)
        );
      }
    });
  };
const appState = {};

const formatAsMoney = (amount, buyerCountry) => {
  const country = countries.find(item => {
    return buyerCountry === item.country
  });
  if (country !== undefined){
    return amount.toLocaleString('en-'+country.code, {
      style: "currency",
      currency: country.currency
    })
  }
  else{
    return amount.toLocaleString('en-US', {
      style: "currency",
      currency: "$"
    })
  }
};
const flagIfInvalid = (field, isValid) => {
  if(isValid){
    field.classList.remove("is-invalid");
  }
  else{
    field.classList.add("is-invalid");
  }
};

const expiryDateFormatIsValid = (field) => {
  return /^(((0)[0-9])|((1)[0-2])|[1-9])(\/)\d{2}$/.test(field.value);
}
const detectCardType = (first4Digits) => {
  const firstDigit = first4Digits[0];
  const creditCardType = document.querySelector("[data-credit-card]");
  const typeImage = document.querySelector("[data-card-type]");
  let cardType;
  if (firstDigit == 4){
    creditCardType.classList.add("is-visa");
    cardType = "is-visa";
    typeImage.src = supportedCards.visa;
  }
  else if (firstDigit == 5){
    creditCardType.classList.remove("is-visa");
    creditCardType.classList.add("is-mastercard");
    cardType = "is-mastercard";
    typeImage.src = supportedCards.mastercard
  }
  return cardType
};
const validateCardExpiryDate = () => {
  const field = document.querySelector("[data-cc-info] input:last-child");
  const date = field.value.split("/");
  let valid = expiryDateFormatIsValid(field)
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() - 2000;
  const currentMonth = currentDate.getMonth() + 1;
  if (valid){
    if (parseInt(date[1]) < currentYear){
      valid = false;
    }
    else if(parseInt(date[1]) === currentYear && parseInt(data[0]) < currentMonth){
      valid = false;
    }
  }
  flagIfInvalid(field, valid);
  return valid
};
const validateCardHolderName = () => {
  const field = document.querySelector("[data-cc-info] input:first-child");
  const name = field.value.split(" ");
  let valid = true;
    if (name.length !== 2){
    valid = false;
  }
  else if(name[0].length < 3 || name[1].length < 3){
    valid = false;
  }
  flagIfInvalid(field, valid);
  return valid;
};
const validateWithLuhn = (digits) => {
  let luhnDigits = [];
  let index = 0;
  digits.forEach((digit, index) => {
    if (index % 2 == 0){
      if ((digits[index] * 2) > 9){
        luhnDigits.push((digit*2)-9)
      }
      else{
        luhnDigits.push(digit*2)
      }
    }
    else {
      luhnDigits.push(digit);
    }
  })
  const sum = luhnDigits.reduce((a,b) => {return parseInt(a) + parseInt(b)}, 0);
  return (sum % 10) == 0;
};
const validateCardNumber = () => {};
const validatePayment = () => {
  validateCardNumber();
  validateCardHolderName();
  validateCardExpiryDate();
};
const smartCursor = (event ,fieldIndex, fields) => {
  fields[fieldIndex].focus()
}
const smartInput = (event, fieldIndex, fields) => {
  if (fieldIndex < 4){
    let {target} = event;
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'];
    const checkAllowed = allowedKeys.includes(event.code);
    if (isNaN(event.key) && !allowedKeys){
      event.preventDefault();
    }
    let innerIndex = target.selectionStart;
    if (target.value.length === 4 && fieldIndex !== 3){
      fieldIndex = fieldIndex + 1;
      smartCursor(event, fieldIndex, fields);
      innerIndex = 0;
      target = fields[fieldIndex]
    }
    if (appState.cardDigits[fieldIndex] == null){
      appState.cardDigits[fieldIndex] = [];
    }
    if (event.key === 'Backspace'){
      appState.cardDigits[fieldIndex][innerIndex-1] = null;
    }
    else if (event.code === 'Delete'){
      appState.cardDigits[fieldIndex][innerIndex] = null;
    }
    let checkNull = false;
    if ((appState.cardDigits[fieldIndex].length < 4 || checkNull) && !isNaN(event.key)){
      appState.cardDigits[fieldIndex][innerIndex] = event.key;
    }
    if (!isNaN(event.key) && fieldIndex < 3){
      setTimeout(() => {
        if (fieldIndex == 0 && appState.cardDigits[fieldIndex].length === 4){
          let first4Digits = appState.cardDigits[fieldIndex];
          detectCardType(first4Digits);
        }
        target.value = '#'.repeat(appState.cardDigits[fieldIndex].length)
      }, 500);
    }
  }
}
const enableSmartTyping = () => {
  nodeList = document.querySelectorAll("input");
  nodeList.forEach((field, index, fields) => {
    field.addEventListener("keydown", (event) => {
      smartInput(event, index, fields);
    });
  })
};
const uiCanInteract = () =>  {
  document.querySelector("[data-cc-digits] input:first-of-type").focus();
  document.querySelector("[data-pay-btn]").addEventListener("click", event => {
    validatePayment
  });
  billHype();
  enableSmartTyping();
};
const displayCartTotal = ({results}) => {
  const [data] = results;
  const {itemsInCart, buyerCountry} = data;
  appState.items = itemsInCart;
  appState.country = buyerCountry;
  appState.bill = itemsInCart.reduce((sum, item) => {
    return sum + item.qty * item.price
  }, 0);
  appState.billFormatted = formatAsMoney(appState.bill, appState.country);
  document.querySelector("[data-bill]").textContent = appState.billFormatted;
  appState.cardDigits = [];
  uiCanInteract();
};

const fetchBill = () => {
    const apiHost = 'https://randomapi.com/api';
const apiKey = '006b08a801d82d0c9824dcfdfdfa3b3c';
const apiEndpoint = `${apiHost}/${apiKey}`;
    fetch(apiEndpoint)
.then(response => response.json())
.then(data => displayCartTotal(data))
.catch(err => console.log(err));
  };

  const startApp = () => {
  fetchBill();
  };

  startApp();
