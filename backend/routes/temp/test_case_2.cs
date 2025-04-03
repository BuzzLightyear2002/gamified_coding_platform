using System;

class Program {
    static int ReverseInteger(int x) {
        int reversed = 0;
        
        while (x != 0) {
            int digit = x % 10; // Get last digit
            x /= 10; // Remove last digit
            
            // Check for overflow before adding the digit
            if (reversed > (int.MaxValue / 10) || reversed < (int.MinValue / 10)) {
                return 0; // Return 0 if overflow occurs
            }

            reversed = reversed * 10 + digit;
        }
        
        return reversed;
    }

    static void Main() {
        int num = 120; // Example input
        Console.WriteLine(ReverseInteger(num)); // Output: 321
    }
}
