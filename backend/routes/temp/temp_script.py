using System;
using System.Collections.Generic;

class Program {
    static int LengthOfLongestSubstring(string s) {
        Dictionary<char, int> charIndexMap = new Dictionary<char, int>();
        int maxLength = 0, left = 0;

        for (int right = 0; right < s.Length; right++) {
            if (charIndexMap.ContainsKey(s[right]) && charIndexMap[s[right]] >= left) {
                left = charIndexMap[s[right]] + 1;
            }
            
            charIndexMap[s[right]] = right;
            maxLength = Math.Max(maxLength, right - left + 1);
        }

        return maxLength;
    }

    static void Main() {
        string input = "123"; // Example input
        int result = LengthOfLongestSubstring(input);
        Console.WriteLine(result); // Expected output: 3
    }
}
