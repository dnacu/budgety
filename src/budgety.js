class Budgety {
  constructor() {
    this.income = 0;
    this.expenses = 0;
    this.incomeList = [];
    this.expensesList = [];
  }

  get percentage() {
    return this.income === 0
      ? "..."
      : `${Math.round((this.expenses / this.income) * 100)}%`;
  }

  get total() {
    return this.income - this.expenses;
  }

  get currentDate() {
    // ["Wed", "Oct", "10", "2018", "12:42:17", "GMT+0900", "(한국", "표준시)"]
    const date = String.prototype.split.call(new Date(), " ");
    return `${date[1]} ${date[3]}`;
  }

  set addToList({ type, description, value }) {
    type === "increase"
      ? this.addToIncomeList(description, value)
      : this.addToExpensesList(description, value);
  }

  set removeFromList({ type, idx }) {
    type === "increase"
      ? this.removeFromIncomeList(idx)
      : this.removeFromExpensesList(idx);
  }

  addToIncomeList(description, value) {
    this.income += value * 1;
    const item = { description, value };
    this.incomeList.push(item);
  }

  addToExpensesList(description, value) {
    this.expenses += value;
    const item = {
      description,
      value,
      getPercentage: () => {
        return this.income === 0 || this.expenses === 0
          ? "..."
          : `${Math.round((value / this.income) * 100)}%`;
      }
    };
    this.expensesList.push(item);
  }

  removeFromIncomeList(idx) {
    this.income -= this.incomeList[idx].value;
    this.incomeList.splice(idx, 1);
  }

  removeFromExpensesList(idx) {
    this.expenses -= this.expensesList[idx].value;
    this.expensesList.splice(idx, 1);
  }
}

const UIController = (() => {
  const DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };

  const getItemDetails = item => {
    const list = item.parentNode;
    const type =
      list.className.split("__")[0] === "income" ? "increase" : "decrease";

    const idx = Array.prototype.indexOf.call(list.children, item);
    return { type, idx };
  };

  const updateIncomeListUI = obj => {
    document.querySelector(DOMstrings.incomeContainer).innerHTML = "";
    obj.incomeList.map(({ description, value }, idx) => {
      const newNode = document.createElement("div");
      newNode.className = "item";
      newNode.key = idx;
      newNode.innerHTML = `
              <div class="item__description">${description}</div>
              <div class="item__value">+ ${value.toFixed(2)}</div>
              <div class="item__delete">
                <button class="item__delete--btn blue">
                  <i class="ion-ios-close-outline"></i>
                </button>
              </div>
            `;
      document.querySelector(DOMstrings.incomeContainer).appendChild(newNode);
    });
  };

  const updateExpensesListUI = obj => {
    document.querySelector(DOMstrings.expensesContainer).innerHTML = "";
    obj.expensesList.map(({ description, value, getPercentage }, idx) => {
      const newNode = document.createElement("div");
      newNode.className = "item";
      newNode.key = idx;
      newNode.innerHTML = `
              <div class="item__description">${description}</div>
              <div class="item__percentage">${getPercentage()}</div>
              <div class="item__value">- ${value.toFixed(2)}</div>
              <div class="item__delete">
                <button class="item__delete--btn red">
                  <i class="ion-ios-close-outline"></i>
                </button>
              </div>
            `;
      document.querySelector(DOMstrings.expensesContainer).appendChild(newNode);
    });
  };

  const getInputValue = () => ({
    type: document.querySelector(DOMstrings.inputType).value,
    description: document.querySelector(DOMstrings.inputDescription).value,
    value: document.querySelector(DOMstrings.inputValue).value * 1
  });

  const updateUI = obj => {
    document.querySelector(DOMstrings.budgetLabel).textContent = `${
      obj.total >= 0 ? "+" : "-"
    } ${Math.abs(obj.total).toFixed(2)}`;

    document.querySelector(
      DOMstrings.incomeLabel
    ).textContent = `+ ${obj.income.toFixed(2)}`;

    document.querySelector(
      DOMstrings.expensesLabel
    ).textContent = `- ${obj.expenses.toFixed(2)}`;

    document.querySelector(DOMstrings.percentageLabel).textContent = `${
      obj.percentage
    }`;

    updateIncomeListUI(obj);
    updateExpensesListUI(obj);

    document.querySelector(DOMstrings.inputDescription).value = "";
    document.querySelector(DOMstrings.inputValue).value = "";
  };

  return {
    ctrlAddItem: (event, obj) => {
      const { type, description, value } = getInputValue();
      if (description !== "" && value !== "" && value * 1 > 0) {
        obj.addToList = { type, description, value };
        updateUI(obj);
      }
    },

    ctrlDeleteItem: (event, obj) => {
      const item = event.target.parentNode.parentNode.parentNode;
      if (item.className === "item") {
        obj.removeFromList = getItemDetails(item);
        updateUI(obj);
      }
    },

    changedType: event => {
      const inputs = document.querySelectorAll(
        `${DOMstrings.inputType}, ${DOMstrings.inputDescription}, ${
          DOMstrings.inputValue
        }`
      );
      Array.prototype.map.call(inputs, selectedInput => {
        selectedInput.classList.toggle("red-box");
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
    },

    setCurrentDate: obj => {
      document.querySelector(".budget__title").textContent += `${
        obj.currentDate
      }:`;
    },

    initialUpdate: obj => {
      updateUI(obj);
    },

    getDOMstrings: () => {
      return DOMstrings;
    }
  };
})();

const controller = ((Budget, UICtrl) => {
  setupEventListeners = () => {
    const { inputBtn, container, inputType } = UICtrl.getDOMstrings();
    document
      .querySelector(inputBtn)
      .addEventListener("click", e => UICtrl.ctrlAddItem(e, Budget));

    document.addEventListener("keypress", function(e) {
      if (event.keyCode === 13 || event.which === 13) {
        UICtrl.ctrlAddItem(e, Budget);
      }
    });

    document
      .querySelector(container)
      .addEventListener("click", e => UICtrl.ctrlDeleteItem(e, Budget));

    document
      .querySelector(inputType)
      .addEventListener("change", UICtrl.changedType);
  };

  return {
    init: () => {
      setupEventListeners();
      UICtrl.setCurrentDate(Budget);
      UICtrl.initialUpdate(Budget);
    }
  };
})(new Budgety(), UIController);

controller.init();
