function addTwoNumbersFromArrays(arr1, arr2) {
  class ListNode {
    constructor(val, next = null) {
      this.val = val;
      this.next = next;
    }
  }

  // Convert array to linked list
  function createLinkedList(arr) {
    let dummy = new ListNode(0);
    let current = dummy;
    for (let num of arr) {
      current.next = new ListNode(num);
      current = current.next;
    }
    return dummy.next;
  }

  // Convert linked list to array
  function linkedListToArray(head) {
    let result = [];
    while (head) {
      result.push(head.val);
      head = head.next;
    }
    return result;
  }

  let l1 = createLinkedList(arr1);
  let l2 = createLinkedList(arr2);

  let dummyHead = new ListNode(0);
  let current = dummyHead;
  let carry = 0;

  while (l1 !== null || l2 !== null || carry > 0) {
    let val1 = l1 ? l1.val : 0;
    let val2 = l2 ? l2.val : 0;

    let sum = val1 + val2 + carry;
    carry = Math.floor(sum / 10);
    current.next = new ListNode(sum % 10);
    current = current.next;

    if (l1) l1 = l1.next;
    if (l2) l2 = l2.next;
  }

  return linkedListToArray(dummyHead.next);
}

// Example usage:
console.log(addTwoNumbersFromArrays([2, 4, 3], [5, 6, 4])); // Output: [7, 0, 8]
