<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user.
     * Accepts name + password + at least one of: email, username, phone
     */
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'nullable|email|unique:users,email',
            'username' => 'nullable|string|min:3|max:50|unique:users,username|alpha_dash',
            'phone'    => 'nullable|string|max:20|unique:users,phone',
            'password' => 'required|string|min:6|confirmed',
        ]);

        // Must provide at least one login identifier
        if (!$request->email && !$request->username && !$request->phone) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Provide at least one of: email, username, or phone number.',
            ], 422);
        }

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email     ?: null,
            'username' => $request->username  ?: null,
            'phone'    => $request->phone     ?: null,
            'password' => $request->password, // auto-hashed by model cast
        ]);

        // Option A: if this is the first user, assign all existing orphaned data
        if (User::count() === 1) {
            DB::table('products')->whereNull('user_id')->update(['user_id' => $user->id]);
            DB::table('shops')->whereNull('user_id')->update(['user_id' => $user->id]);
            DB::table('movements')->whereNull('user_id')->update(['user_id' => $user->id]);
        }

        $token = $user->createToken('charly-hb')->plainTextToken;

        return response()->json([
            'status'  => 'success',
            'message' => 'Account created successfully.',
            'data'    => [
                'user'  => $this->userResponse($user),
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Login — accepts email, username, or phone in a single 'login' field
     */
    public function login(Request $request)
    {
        $request->validate([
            'login'    => 'required|string',
            'password' => 'required|string',
        ]);

        $login = $request->login;

        // Detect which field was provided
        $user = null;
        if (filter_var($login, FILTER_VALIDATE_EMAIL)) {
            $user = User::where('email', $login)->first();
        } elseif (preg_match('/^\+?[0-9]{7,15}$/', preg_replace('/\s/', '', $login))) {
            $user = User::where('phone', $login)->first();
        } else {
            $user = User::where('username', $login)->first();
        }

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['The credentials you entered are incorrect.'],
            ]);
        }

        // Revoke old tokens and issue fresh one
        $user->tokens()->delete();
        $token = $user->createToken('charly-hb')->plainTextToken;

        return response()->json([
            'status'  => 'success',
            'message' => 'Logged in successfully.',
            'data'    => [
                'user'  => $this->userResponse($user),
                'token' => $token,
            ],
        ]);
    }

    /**
     * Logout — revoke current token
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->forceDelete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Return authenticated user info
     */
    public function me(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data'   => $this->userResponse($request->user()),
        ]);
    }

    /**
     * Update authenticated user's profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name'         => 'sometimes|string|max:255',
            'email'        => 'sometimes|nullable|email|unique:users,email,' . $user->id,
            'username'     => 'sometimes|nullable|string|min:3|max:50|alpha_dash|unique:users,username,' . $user->id,
            'phone'        => 'sometimes|nullable|string|max:20|unique:users,phone,' . $user->id,
            'current_password' => 'required_with:new_password|string',
            'new_password' => 'sometimes|string|min:6|confirmed',
        ]);

        // If changing password, verify current password first
        if ($request->filled('new_password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Current password is incorrect.',
                ], 422);
            }
            $user->password = $request->new_password;
        }

        if ($request->filled('name'))     $user->name     = $request->name;
        if ($request->has('email'))       $user->email    = $request->email    ?: null;
        if ($request->has('username'))    $user->username = $request->username ?: null;
        if ($request->has('phone'))       $user->phone    = $request->phone    ?: null;

        $user->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'Profile updated successfully.',
            'data'    => $this->userResponse($user),
        ]);
    }

    private function userResponse(User $user): array
    {
        return [
            'id'       => $user->id,
            'name'     => $user->name,
            'email'    => $user->email,
            'username' => $user->username,
            'phone'    => $user->phone,
        ];
    }
}
