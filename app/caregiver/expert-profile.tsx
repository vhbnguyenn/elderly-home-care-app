// ExpertProfileScreen.js
import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "@/services/axiosInstance";
import { API_CONFIG } from "@/services/config/api.config";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const GENDER_OPTIONS = ["Nam", "Nữ"];
const EDUCATION_OPTIONS = [
  "Trung học cơ sở",
  "Trung học phổ thông",
  "Cao đẳng",
  "Đại học",
  "Sau đại học",
];

export default function ExpertProfileScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // avatar & cccd images
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [cccdFrontUri, setCccdFrontUri] = useState<string | null>(null);
  const [cccdBackUri, setCccdBackUri] = useState<string | null>(null);

  // basic info (non-editable)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // personal & contact
  const [dob, setDob] = useState(""); // mm/dd/yyyy
  const [gender, setGender] = useState("");
  const [showGenderModal, setShowGenderModal] = useState(false);

  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [temporaryAddress, setTemporaryAddress] = useState("");

  // career
  const [yearsExp, setYearsExp] = useState("0");
  const [workPlace, setWorkPlace] = useState("");
  const [education, setEducation] = useState("");
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [universityDegreeUri, setUniversityDegreeUri] = useState<string | null>(null);
  const [selfIntroduction, setSelfIntroduction] = useState("");

  // Fetch profile data from API
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.CAREGIVER.GET_OWN_PROFILE);
      const profileData = response.data.data || response.data;

      // Map API data to state
      if (profileData) {
        // Basic info
        setFullName(profileData.user?.name || user?.name || "");
        setEmail(profileData.user?.email || user?.email || "");
        
        // Personal info
        if (profileData.dateOfBirth) {
          const date = new Date(profileData.dateOfBirth);
          const formatted = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
          setDob(formatted);
        }
        setGender(profileData.gender || "");
        setIdNumber(profileData.idCardNumber || "");
        setPhone(profileData.phoneNumber || "");
        setPermanentAddress(profileData.permanentAddress || "");
        setTemporaryAddress(profileData.temporaryAddress || "");
        
        // Career info
        setYearsExp(String(profileData.yearsOfExperience || 0));
        setWorkPlace(profileData.workHistory || "");
        
        // Map education from API to display format
        const educationMap: { [key: string]: string } = {
          "trung học cơ sở": "Trung học cơ sở",
          "trung học phổ thông": "Trung học phổ thông",
          "cao đẳng": "Cao đẳng",
          "đại học": "Đại học",
          "sau đại học": "Sau đại học",
        };
        setEducation(educationMap[profileData.education?.toLowerCase()] || profileData.education || "");
        
        setSelfIntroduction(profileData.bio || "");
        
        // Images
        setAvatarUri(profileData.profileImage || null);
        setCccdFrontUri(profileData.idCardFrontImage || null);
        setCccdBackUri(profileData.idCardBackImage || null);
        setUniversityDegreeUri(profileData.universityDegreeImage || null);
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      if (err.response?.status === 404) {
        setError("Chưa có hồ sơ. Vui lòng hoàn thiện hồ sơ.");
      } else {
        setError("Không thể tải thông tin hồ sơ. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  }, [user?.name, user?.email]);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // request permission for image picker
  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Quyền truy cập",
            "Cần quyền truy cập thư viện ảnh để tải lên ảnh."
          );
        }
      }
    })();
  }, []);

  const pickImage = async (setter: (uri: string | null) => void) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setter(result.assets[0].uri);
      }
    } catch (err) {
      console.warn("ImagePicker error:", err);
    }
  };

  const takePhoto = async (setter: (uri: string | null) => void) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Quyền camera", "Cần quyền camera để chụp ảnh.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        setter(result.assets[0].uri);
      }
    } catch (err) {
      console.warn("Camera error:", err);
    }
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (imageUri: string): Promise<string | null> => {
    try {
      const formData = new FormData();
      
      // Create file object from URI
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('file', {
        uri: imageUri,
        name: filename,
        type,
      } as any);
      
      formData.append('upload_preset', 'elderly-care');
      formData.append('folder', 'elderly-care');

      const response = await fetch(
        'https://api.cloudinary.com/v1_1/douyvufca/image/upload',
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const data = await response.json();
      return data.secure_url || null;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const onSave = async () => {
    try {
      setSaving(true);
      
      // Upload images to Cloudinary if they are new (local URIs)
      let profileImageUrl = avatarUri;
      let universityDegreeUrl = universityDegreeUri;

      // Upload avatar if it's a local file
      if (avatarUri && !avatarUri.startsWith('http')) {
        const uploadedUrl = await uploadImageToCloudinary(avatarUri);
        if (uploadedUrl) {
          profileImageUrl = uploadedUrl;
        } else {
          Alert.alert("Lỗi", "Không thể tải ảnh đại diện lên. Vui lòng thử lại.");
          setSaving(false);
          return;
        }
      }

      // Upload university degree if it's a local file and education is university level
      if (universityDegreeUri && !universityDegreeUri.startsWith('http') && 
          (education === "Đại học" || education === "Sau đại học")) {
        const uploadedUrl = await uploadImageToCloudinary(universityDegreeUri);
        if (uploadedUrl) {
          universityDegreeUrl = uploadedUrl;
        } else {
          Alert.alert("Lỗi", "Không thể tải ảnh bằng đại học lên. Vui lòng thử lại.");
          setSaving(false);
          return;
        }
      }

      const payload: any = {
        phoneNumber: phone,
        temporaryAddress,
        yearsOfExperience: Number(yearsExp),
        workHistory: workPlace,
        education: education.toLowerCase(),
        bio: selfIntroduction,
      };

      // Add profileImage if changed
      if (profileImageUrl && !avatarUri?.startsWith('http')) {
        payload.profileImage = profileImageUrl;
      }

      // Add universityDegreeImage only if education is university level
      if ((education === "Đại học" || education === "Sau đại học") && universityDegreeUrl) {
        payload.universityDegreeImage = universityDegreeUrl;
      }

      await axiosInstance.put(API_CONFIG.ENDPOINTS.CAREGIVER.UPDATE_PROFILE, payload);
      
      Alert.alert("Thành công", "Thông tin hồ sơ đã được cập nhật.", [
        { text: "OK", onPress: () => fetchProfileData() }
      ]);
    } catch (err: any) {
      console.error("Error saving profile:", err);
      Alert.alert(
        "Lỗi",
        err.response?.data?.message || "Không thể lưu thông tin. Vui lòng thử lại."
      );
    } finally {
      setSaving(false);
    }
  };

  const renderModalList = (data: string[], onSelect: (val: string) => void) => (
    <FlatList
      data={data}
      keyExtractor={(i) => i}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => {
            onSelect(item);
          }}
        >
          <Text style={styles.optionText}>{item}</Text>
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => (
        <View style={{ height: 1, backgroundColor: "#eee" }} />
      )}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 16, color: "#64748B" }}>Đang tải thông tin...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#EF4444" />
          <Text style={{ fontSize: 16, color: "#EF4444", marginTop: 12, textAlign: "center" }}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { marginTop: 20 }]}
            onPress={fetchProfileData}
          >
            <Text style={styles.primaryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Avatar section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Ảnh đại diện</Text>
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrapper}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>Ảnh</Text>
                </View>
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => pickImage(setAvatarUri)}
              >
                <Text style={styles.primaryBtnText}>Chọn ảnh mới</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.ghostBtn, { marginTop: 10 }]}
                onPress={() => takePhoto(setAvatarUri)}
              >
                <Text style={styles.ghostBtnText}>Chụp ảnh</Text>
              </TouchableOpacity>

              <Text style={styles.smallNote}>
                Chấp nhận: JPG, PNG (tối đa 5MB)
              </Text>
            </View>
          </View>
        </View>

        {/* 1. Basic info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1. Thông tin cơ bản</Text>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Họ tên</Text>
              <TextInput
                value={fullName}
                placeholder="Họ tên"
                style={[styles.input, styles.disabledInput]}
                editable={false}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                placeholder="Email"
                keyboardType="email-address"
                style={[styles.input, styles.disabledInput]}
                editable={false}
              />
            </View>
          </View>
        </View>

        {/* 2. Personal info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            2. Thông tin cá nhân & liên hệ
          </Text>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Ngày sinh</Text>
              <TextInput
                placeholder="mm/dd/yyyy"
                value={dob}
                style={[styles.input, styles.disabledInput]}
                editable={false}
              />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Giới tính</Text>
              <View
                style={[styles.input, styles.disabledInput, { justifyContent: "center" }]}
              >
                <Text style={{ color: gender ? "#9CA3AF" : "#9CA3AF" }}>
                  {gender || "Chưa cập nhật"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Số CMND/CCCD</Text>
              <TextInput
                value={idNumber}
                placeholder="Số CMND/CCCD"
                style={[styles.input, styles.disabledInput]}
                editable={false}
              />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="0123456789"
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>
          </View>

          <Text style={[styles.label, { marginTop: 8 }]}>
            Địa chỉ thường trú
          </Text>
          <TextInput
            value={permanentAddress}
            placeholder="Địa chỉ thường trú"
            style={[styles.input, { height: 80 }, styles.disabledInput]}
            multiline
            editable={false}
          />

          <Text style={[styles.label, { marginTop: 8 }]}>Địa chỉ tạm trú</Text>
          <TextInput
            value={temporaryAddress}
            onChangeText={setTemporaryAddress}
            placeholder="Địa chỉ tạm trú"
            style={[styles.input, { height: 80 }]}
            multiline
          />
        </View>

        {/* CCCD images */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Ảnh CCCD/CMND</Text>
          <Text style={styles.disabledNote}>
            Ảnh CCCD không thể chỉnh sửa sau khi đã xác thực
          </Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}
          >
            <View style={styles.cccdBlock}>
              <Text style={styles.smallLabel}>Ảnh CCCD mặt trước</Text>
              <View style={styles.cccdPicker}>
                {cccdFrontUri ? (
                  <Image
                    source={{ uri: cccdFrontUri }}
                    style={styles.cccdPreview}
                  />
                ) : (
                  <Text style={styles.cccdPlaceholder}>
                    Chưa có ảnh CCCD mặt trước
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.cccdBlock}>
              <Text style={styles.smallLabel}>Ảnh CCCD mặt sau</Text>
              <View style={styles.cccdPicker}>
                {cccdBackUri ? (
                  <Image
                    source={{ uri: cccdBackUri }}
                    style={styles.cccdPreview}
                  />
                ) : (
                  <Text style={styles.cccdPlaceholder}>
                    Chưa có ảnh CCCD mặt sau
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* 3. Career info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>3. Thông tin nghề nghiệp</Text>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Số năm kinh nghiệm</Text>
              <TextInput
                value={yearsExp}
                onChangeText={setYearsExp}
                placeholder="0"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Nơi từng làm việc</Text>
              <TextInput
                value={workPlace}
                onChangeText={setWorkPlace}
                placeholder="Nơi từng làm việc"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Học vấn</Text>
              <TouchableOpacity
                style={[styles.input, { justifyContent: "center" }]}
                onPress={() => setShowEducationModal(true)}
              >
                <Text style={{ color: education ? "#000" : "#9CA3AF" }}>
                  {education || "Chọn trình độ"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ width: 12 }} />
          </View>

          {/* University Degree Image - only for Đại học and Sau đại học */}
          {(education === "Đại học" || education === "Sau đại học") && (
            <>
              <Text style={[styles.label, { marginTop: 8 }]}>
                Bằng đại học
              </Text>
              <View style={styles.degreeImageContainer}>
                {universityDegreeUri ? (
                  <Image
                    source={{ uri: universityDegreeUri }}
                    style={styles.degreeImage}
                  />
                ) : (
                  <Text style={styles.cccdPlaceholder}>
                    Chưa có ảnh bằng đại học
                  </Text>
                )}
              </View>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                <TouchableOpacity
                  style={[styles.ghostBtn, { flex: 1 }]}
                  onPress={() => pickImage(setUniversityDegreeUri)}
                >
                  <Text style={styles.ghostBtnText}>Chọn ảnh</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.ghostBtn, { flex: 1 }]}
                  onPress={() => takePhoto(setUniversityDegreeUri)}
                >
                  <Text style={styles.ghostBtnText}>Chụp ảnh</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <Text style={[styles.label, { marginTop: 8 }]}>
            Chứng chỉ và kỹ năng
          </Text>
          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => navigation.navigate("Chứng chỉ và kỹ năng")}
          >
            <View style={styles.linkCardContent}>
              <MaterialCommunityIcons name="certificate" size={20} color="#2563EB" />
              <Text style={styles.linkCardText}>
                Quản lý chứng chỉ và kỹ năng
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <Text style={[styles.label, { marginTop: 12 }]}>
            Giới thiệu bản thân
          </Text>
          <TextInput
            value={selfIntroduction}
            onChangeText={setSelfIntroduction}
            placeholder="Viết một đoạn ngắn giới thiệu về bản thân, kinh nghiệm và điểm mạnh của bạn..."
            style={[styles.input, { height: 100, textAlignVertical: "top", paddingTop: 10 }]}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Actions */}
        <View
          style={{
            paddingHorizontal: 16,
            marginTop: 16,
            marginBottom: 20,
            alignItems: "flex-end",
          }}
        >
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: saving ? "#9CA3AF" : "#10B981", paddingHorizontal: 32 }]}
            onPress={onSave}
            disabled={saving}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              {saving ? "Đang lưu..." : "Lưu"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Gender modal */}
        <Modal visible={showGenderModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Chọn giới tính</Text>
              {renderModalList(GENDER_OPTIONS, (val) => {
                setGender(val);
                setShowGenderModal(false);
              })}
              <TouchableOpacity
                onPress={() => setShowGenderModal(false)}
                style={styles.modalClose}
              >
                <Text style={{ color: "#2563EB", fontWeight: "700" }}>
                  Đóng
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Education modal */}
        <Modal visible={showEducationModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Chọn trình độ</Text>
              {renderModalList(EDUCATION_OPTIONS, (val) => {
                setEducation(val);
                setShowEducationModal(false);
              })}
              <TouchableOpacity
                onPress={() => setShowEducationModal(false)}
                style={styles.modalClose}
              >
                <Text style={{ color: "#2563EB", fontWeight: "700" }}>
                  Đóng
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
      )}
      
      {/* Bottom Navigation */}
      <CaregiverBottomNav activeTab="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  sectionCard: {
    backgroundColor: "#fff",
    margin: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 12,
    color: "#0F172A",
  },

  avatarRow: { flexDirection: "row", alignItems: "center" },
  avatarWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: { width: 84, height: 84, resizeMode: "cover" },
  avatarPlaceholder: {
    width: 84,
    height: 84,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholderText: { color: "#94A3B8" },

  primaryBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  ghostBtn: {
    backgroundColor: "#F8FAFC",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6EEF8",
  },
  ghostBtnText: { color: "#334155", fontWeight: "600" },
  smallNote: { marginTop: 8, color: "#9CA3AF", fontSize: 12 },

  row: { flexDirection: "row", marginBottom: 10 },
  label: { marginBottom: 6, color: "#334155", fontWeight: "600" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E6EEF8",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 44,
  },
  disabledInput: {
    backgroundColor: "#F9FAFB",
    color: "#9CA3AF",
  },
  disabledNote: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "400",
  },
  linkCard: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  linkCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  linkCardText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  degreeImageContainer: {
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E6EEF8",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FCFCFD",
    overflow: "hidden",
  },
  degreeImage: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
  },

  cccdBlock: { width: "48%" },
  cccdPicker: {
    height: 110,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E6EEF8",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FCFCFD",
  },
  cccdPreview: {
    width: "100%",
    height: 110,
    borderRadius: 8,
    resizeMode: "cover",
  },
  cccdPlaceholder: {
    color: "#94A3B8",
    textAlign: "center",
    paddingHorizontal: 6,
  },
  cccdActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  ghostBtnSmall: {
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E6EEF8",
  },
  ghostBtnTextSmall: { color: "#334155", fontSize: 12 },

  noteBox: {
    marginTop: 10,
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E6EEF8",
    color: "#64748B",
  },

  smallLabel: { color: "#475569", fontWeight: "700", marginBottom: 6 },

  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: "50%",
  },
  modalTitle: { fontWeight: "700", fontSize: 16, marginBottom: 8 },
  optionItem: { paddingVertical: 12 },
  optionText: { fontSize: 15 },
  modalClose: { marginTop: 12, alignItems: "center" },

  // small helpers
  sectionLabel: { fontWeight: "700", marginTop: 12 },
});
