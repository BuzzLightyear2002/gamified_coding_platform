def two_sum(nums, target):
    num_map = {}  # Store number and its index

    for i, num in enumerate(nums):
        diff = target - num
        if diff in num_map:
            return [num_map[diff], i]
        num_map[num] = i


print(two_sum([1,2,3,4,5], 9))