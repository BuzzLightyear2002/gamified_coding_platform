def two_sum(nums, target):
    num_map = {}  # Store number and its index

    for i, num in enumerate(nums):
        diff = target - num
        if diff in num_map:
            return [num_map[diff], i]
        num_map[num] = i


print(two_sum([3, 2, 4], 6))